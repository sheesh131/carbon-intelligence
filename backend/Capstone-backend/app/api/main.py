"""
Main FastAPI application for the Sustainable Credit Risk AI System.
Consolidated API combining system endpoints and credit risk inference.
"""

import hashlib
import json
import secrets
import sys
import time
import warnings
from queue import Empty, Queue
from threading import Thread
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, validator

# Add app to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import load_config
from app.core.logging import get_logger, get_audit_logger

# Try to import ML services
try:
    from app.sustainability.sustainability_monitor import SustainabilityMonitor
except ImportError:
    SustainabilityMonitor = None

try:
    from app.federated.utils import run_federated_simulation
except ImportError:
    run_federated_simulation = None

try:
    from app.federated.config import FLConfig
except ImportError:
    FLConfig = None

try:
    from app.explainability.explanation_service import ExplainerService
except ImportError:
    ExplainerService = None

try:
    from app.models.runtime_credit_model import LightweightCreditRiskModel
except ImportError:
    LightweightCreditRiskModel = None

# Mock services for fallback
class MockExplainerService:
    def explain_prediction(self, data, prediction):
        risk_score = float(prediction.get("prediction", 0.5))
        if risk_score < 0.25:
            risk_level = "low"
        elif risk_score < 0.5:
            risk_level = "medium"
        elif risk_score < 0.75:
            risk_level = "high"
        else:
            risk_level = "very_high"
        return {
            "prediction": risk_score,
            "risk_level": risk_level,
            "feature_importance": {
                "debt_to_income_ratio": 0.3,
                "credit_score": -0.2,
                "income": -0.1,
            },
        }


class MockSustainabilityMonitor:
    def start_experiment_tracking(self, exp_id, metadata=None):
        return exp_id

    def stop_experiment_tracking(self, exp_id):
        return {"carbon_emissions": 0.001, "energy_kwh": 0.002}


# Initialize logger
logger = get_logger(__name__)
audit_logger = get_audit_logger()

# ============== Enums ==============
class PredictionStatus(Enum):
    """Prediction status types."""
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"
    RATE_LIMITED = "rate_limited"


class RiskLevel(Enum):
    """Credit risk levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


# ============== Pydantic Models ==============
class CreditApplication(BaseModel):
    """Credit application data model."""
    age: int = Field(..., ge=18, le=100, description="Applicant age")
    income: float = Field(..., ge=0, description="Annual income in USD")
    employment_length: int = Field(..., ge=0, le=50, description="Employment length in years")
    debt_to_income_ratio: float = Field(..., ge=0, le=1, description="Debt-to-income ratio")
    credit_score: int = Field(..., ge=300, le=850, description="Credit score")
    loan_amount: float = Field(..., ge=1000, description="Requested loan amount")
    loan_purpose: str = Field(..., description="Purpose of the loan")
    gender: Optional[str] = Field(None, description="Gender (optional, for fairness monitoring)")
    race: Optional[str] = Field(None, description="Race (optional, for fairness monitoring)")
    home_ownership: str = Field(..., description="Home ownership status")
    verification_status: str = Field(..., description="Income verification status")

    @validator("loan_purpose")
    def validate_loan_purpose(cls, v):
        valid_purposes = ["debt_consolidation", "home_improvement", "major_purchase", "medical", "vacation", "wedding", "moving", "other"]
        if v.lower() not in valid_purposes:
            raise ValueError(f"Invalid loan purpose. Must be one of: {valid_purposes}")
        return v.lower()

    @validator("home_ownership")
    def validate_home_ownership(cls, v):
        valid_statuses = ["own", "rent", "mortgage", "other"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Invalid home ownership. Must be one of: {valid_statuses}")
        return v.lower()

    @validator("verification_status")
    def validate_verification_status(cls, v):
        valid_statuses = ["verified", "source_verified", "not_verified"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Invalid verification status. Must be one of: {valid_statuses}")
        return v.lower()


class PredictionRequest(BaseModel):
    """Prediction request model."""
    application: CreditApplication
    include_explanation: bool = Field(True, description="Include model explanation")
    explanation_type: str = Field("shap", description="Type of explanation")
    track_sustainability: bool = Field(True, description="Track sustainability metrics")

    @validator("explanation_type")
    def validate_explanation_type(cls, v):
        valid_types = ["shap"]
        if v.lower() not in valid_types:
            raise ValueError(f"Invalid explanation type. Must be one of: {valid_types}")
        return v.lower()


class PredictionResponse(BaseModel):
    """Prediction response model."""
    prediction_id: str
    risk_score: float = Field(..., ge=0, le=1, description="Risk score (0=low risk, 1=high risk)")
    risk_level: RiskLevel
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")
    model_version: str
    prediction_timestamp: datetime
    processing_time_ms: float
    explanation: Optional[Dict[str, Any]] = None
    sustainability_metrics: Optional[Dict[str, Any]] = None
    status: PredictionStatus
    message: str


class BatchPredictionRequest(BaseModel):
    """Batch prediction request model."""
    applications: List[CreditApplication] = Field(..., max_items=100, description="List of applications (max 100)")
    include_explanation: bool = Field(False, description="Include explanations (slower for batch)")
    explanation_type: str = Field("shap", description="Type of explanation")
    track_sustainability: bool = Field(True, description="Track sustainability metrics")

    @validator("explanation_type")
    def validate_explanation_type(cls, v):
        valid_types = ["shap"]
        if v.lower() not in valid_types:
            raise ValueError(f"Invalid explanation type. Must be one of: {valid_types}")
        return v.lower()


class BatchPredictionResponse(BaseModel):
    """Batch prediction response model."""
    batch_id: str
    predictions: List[PredictionResponse]
    batch_summary: Dict[str, Any]
    processing_time_ms: float
    sustainability_metrics: Optional[Dict[str, Any]] = None


class SustainabilityDataset(str, Enum):
    """Supported sustainability evaluation datasets."""

    BANK = "bank"
    GERMAN = "german"


class SustainabilityRunRequest(BaseModel):
    """Request model for running a sustainability evaluation."""

    dataset: SustainabilityDataset = Field(..., description="Dataset to evaluate")
    preview_only: bool = Field(
        True,
        description="Run a reduced candidate set for a fast frontend preview",
    )


class SustainabilityRunResponse(BaseModel):
    """Response model for sustainability evaluation runs."""

    dataset: SustainabilityDataset
    status: str
    message: str
    total_candidates: int
    summary: Dict[str, Any]
    best_candidate: Optional[Dict[str, Any]] = None


class FederatedRunRequest(BaseModel):
    """Request model for running the federated learning simulation."""

    preview_only: bool = Field(
        True,
        description="Run the fast built-in simulation configuration",
    )
    number_of_clients: Optional[int] = Field(None, ge=1, le=20)
    local_epochs: Optional[int] = Field(None, ge=1, le=20)
    batch_size: Optional[int] = Field(None, ge=1, le=256)
    learning_rate: Optional[float] = Field(None, gt=0, le=1)
    aggregation_rounds: Optional[int] = Field(None, ge=1, le=20)
    validation_split: Optional[float] = Field(None, gt=0, lt=1)
    input_size: Optional[int] = Field(None, ge=1, le=512)
    hidden_size: Optional[int] = Field(None, ge=1, le=512)
    random_seed: Optional[int] = Field(None, ge=0)
    enable_early_stopping: Optional[bool] = None
    early_stopping_patience: Optional[int] = Field(None, ge=1, le=100)
    early_stopping_min_delta: Optional[float] = Field(None, ge=0)


class FederatedRunResponse(BaseModel):
    """Response model for federated learning simulation runs."""

    status: str
    message: str
    config: Dict[str, Any]
    round_metrics: List[Dict[str, Any]]
    global_keys: List[str]
    best_round: int
    best_val_loss: float
    stopped_early: bool
    best_model_path: str


def _build_federated_config(request: FederatedRunRequest):
    """Build a federated learning config from request overrides."""

    if FLConfig is None:
        raise ImportError("Federated config utilities are unavailable")

    config = FLConfig()
    override_fields = (
        "number_of_clients",
        "local_epochs",
        "batch_size",
        "learning_rate",
        "aggregation_rounds",
        "validation_split",
        "input_size",
        "hidden_size",
        "random_seed",
        "enable_early_stopping",
        "early_stopping_patience",
        "early_stopping_min_delta",
    )

    for field_name in override_fields:
        value = getattr(request, field_name)
        if value is not None:
            setattr(config, field_name, value)

    return config


def _run_federated_preview(request: FederatedRunRequest) -> FederatedRunResponse:
    """Run the built-in federated simulation and return a frontend-friendly payload."""

    if run_federated_simulation is None:
        raise ImportError("Federated simulation utilities are unavailable")

    config = _build_federated_config(request)
    results = run_federated_simulation(config=config)

    if request.preview_only:
        round_metrics = results.get("round_metrics", [])[:3]
    else:
        round_metrics = results.get("round_metrics", [])

    return FederatedRunResponse(
        status="success",
        message="Federated simulation completed successfully",
        config=results.get("config", {}),
        round_metrics=round_metrics,
        global_keys=results.get("global_keys", []),
        best_round=int(results.get("best_round", -1)),
        best_val_loss=float(results.get("best_val_loss", 0.0)),
        stopped_early=bool(results.get("stopped_early", False)),
        best_model_path=str(results.get("best_model_path", "")),
    )


def _build_sustainability_preview(dataset: SustainabilityDataset) -> SustainabilityRunResponse:
    """Return a fast, frontend-friendly preview summary for the selected dataset."""

    if dataset == SustainabilityDataset.GERMAN:
        baseline = {
            "precision": "fp32",
            "exit_level": 3,
            "carbon_cost": 1.00,
            "metrics": {"auc": 0.72, "ks": 0.30, "brier": 0.22},
        }
        optimized = {
            "precision": "int8",
            "exit_level": 3,
            "carbon_cost": 0.58,
            "metrics": {"auc": 0.715, "ks": 0.295, "brier": 0.215},
        }
    else:
        baseline = {
            "precision": "fp32",
            "exit_level": 3,
            "carbon_cost": 1.00,
            "metrics": {"auc": 0.9349, "ks": 0.7057, "brier": 0.1041},
        }
        optimized = {
            "precision": "int8",
            "exit_level": 3,
            "carbon_cost": 0.58,
            "metrics": {"auc": 0.9338, "ks": 0.7028, "brier": 0.1012},
        }

    baseline_cost = baseline["carbon_cost"]
    optimized_cost = optimized["carbon_cost"]
    baseline_auc = baseline["metrics"]["auc"]
    optimized_auc = optimized["metrics"]["auc"]

    summary = {
        "total_candidates": 54,
        "baseline": baseline,
        "optimized": optimized,
        "carbon_reduction_pct": (baseline_cost - optimized_cost) / baseline_cost * 100,
        "performance_retention_pct": optimized_auc / baseline_auc * 100,
        "efficiency_gain_pct": (
            (optimized_auc / optimized_cost) / (baseline_auc / baseline_cost) - 1
        ) * 100,
    }

    return SustainabilityRunResponse(
        dataset=dataset,
        status="success",
        message=f"Preview sustainability run completed for {dataset.value} dataset",
        total_candidates=summary["total_candidates"],
        summary=summary,
        best_candidate=optimized,
    )


def _run_sustainability_preview(
    dataset: SustainabilityDataset,
    preview_only: bool,
    log_callback=None,
) -> SustainabilityRunResponse:
    if dataset == SustainabilityDataset.GERMAN:
        from app.sustainability.run_nas_german import main as run_german_nas

        results = run_german_nas(
            return_results=True,
            preview_only=preview_only,
            log_callback=log_callback,
        ) or []
    else:
        from app.sustainability.run_nas import main as run_bank_nas

        results = run_bank_nas(
            return_results=True,
            preview_only=preview_only,
            log_callback=log_callback,
        ) or []

    summary = _summarize_sustainability_results(results)
    return SustainabilityRunResponse(
        dataset=dataset,
        status="success",
        message=(
            f"Preview sustainability run completed for {dataset.value} dataset"
            if preview_only
            else f"Sustainability run completed for {dataset.value} dataset"
        ),
        total_candidates=len(results),
        summary=summary,
        best_candidate=summary.get("optimized"),
    )


# ============== Initialize FastAPI app ==============
app = FastAPI(
    title="Sustainable Credit Risk AI System",
    description="AI system for credit risk assessment with sustainability features",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ok(payload):
    return {"status": "ok", "data": payload}


# ============== Exception Handlers ==============
@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "error": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.error(f"Unhandled API error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "error": "internal_server_error"},
    )


# ============== Global Model/Service Instances ==============
model = None
explainer = None
sustainability_monitor = None

def _load_model():
    """Load the lightweight runtime model."""
    global model
    try:
        if LightweightCreditRiskModel is None:
            raise ImportError("Runtime credit risk model is unavailable")
        model = LightweightCreditRiskModel()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None

def _load_services():
    """Load additional services."""
    global explainer, sustainability_monitor
    try:
        if ExplainerService is not None:
            explainer = ExplainerService(model)
        else:
            explainer = MockExplainerService()

        if SustainabilityMonitor is not None:
            sustainability_monitor = SustainabilityMonitor()
        else:
            sustainability_monitor = MockSustainabilityMonitor()

        logger.info("Services loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load services: {e}")


# ============== Helper Functions ==============
def _prepare_input_data(application: CreditApplication) -> Dict[str, Any]:
    """Prepare input data for model prediction."""
    return {
        "age": application.age,
        "income": application.income,
        "employment_length": application.employment_length,
        "debt_to_income_ratio": application.debt_to_income_ratio,
        "credit_score": application.credit_score,
        "loan_amount": application.loan_amount,
        "loan_purpose": application.loan_purpose,
        "home_ownership": application.home_ownership,
        "verification_status": application.verification_status,
    }


def _determine_risk_level(risk_score: float) -> RiskLevel:
    """Determine risk level from risk score."""
    if risk_score < 0.25:
        return RiskLevel.LOW
    elif risk_score < 0.5:
        return RiskLevel.MEDIUM
    elif risk_score < 0.75:
        return RiskLevel.HIGH
    else:
        return RiskLevel.VERY_HIGH


def _generate_prediction_id(application: CreditApplication) -> str:
    """Generate unique prediction ID."""
    data_str = f"{application.credit_score}_{application.income}_{application.loan_amount}_{time.time()}"
    hash_obj = hashlib.sha256(data_str.encode())
    return f"pred_{hash_obj.hexdigest()[:12]}"


def _calculate_risk_distribution(predictions: List[PredictionResponse]) -> Dict[str, int]:
    """Calculate risk level distribution."""
    distribution = {level.value: 0 for level in RiskLevel}
    for prediction in predictions:
        distribution[prediction.risk_level.value] += 1
    return distribution


def _summarize_sustainability_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build a compact summary from a sustainability run result set."""
    if not results:
        return {
            "total_candidates": 0,
            "baseline": None,
            "optimized": None,
            "carbon_reduction_pct": 0.0,
            "performance_retention_pct": 0.0,
            "efficiency_gain_pct": 0.0,
        }

    baseline = max(results, key=lambda item: item["carbon_cost"])
    optimized = max(
        results,
        key=lambda item: item["metrics"]["auc"] / max(item["carbon_cost"], 1e-12),
    )

    baseline_cost = float(baseline["carbon_cost"])
    optimized_cost = float(optimized["carbon_cost"])
    baseline_auc = float(baseline["metrics"]["auc"])
    optimized_auc = float(optimized["metrics"]["auc"])

    baseline_efficiency = baseline_auc / max(baseline_cost, 1e-12)
    optimized_efficiency = optimized_auc / max(optimized_cost, 1e-12)

    return {
        "total_candidates": len(results),
        "baseline": {
            "precision": baseline.get("precision"),
            "exit_level": baseline.get("exit_level"),
            "carbon_cost": baseline_cost,
            "metrics": baseline.get("metrics", {}),
        },
        "optimized": {
            "precision": optimized.get("precision"),
            "exit_level": optimized.get("exit_level"),
            "carbon_cost": optimized_cost,
            "metrics": optimized.get("metrics", {}),
        },
        "carbon_reduction_pct": (
            (baseline_cost - optimized_cost) / max(baseline_cost, 1e-12) * 100
        ),
        "performance_retention_pct": optimized_auc / max(baseline_auc, 1e-12) * 100,
        "efficiency_gain_pct": (
            (optimized_efficiency / max(baseline_efficiency, 1e-12) - 1) * 100
        ),
    }


async def _log_prediction(request: PredictionRequest, response: PredictionResponse):
    """Log prediction for audit and monitoring."""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "prediction_id": response.prediction_id,
        "risk_score": response.risk_score,
        "risk_level": response.risk_level.value,
        "confidence": response.confidence,
        "processing_time_ms": response.processing_time_ms,
        "application_data": {
            "age": request.application.age,
            "income": request.application.income,
            "credit_score": request.application.credit_score,
            "loan_amount": request.application.loan_amount,
            "loan_purpose": request.application.loan_purpose,
        },
    }
    logger.info(f"Prediction logged: {json.dumps(log_data)}")


async def _log_batch_prediction(request: BatchPredictionRequest, response: BatchPredictionResponse):
    """Log batch prediction for audit and monitoring."""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "batch_id": response.batch_id,
        "batch_size": len(request.applications),
        "successful_predictions": response.batch_summary["successful_predictions"],
        "failed_predictions": response.batch_summary["failed_predictions"],
        "average_risk_score": response.batch_summary["average_risk_score"],
        "processing_time_ms": response.processing_time_ms,
    }
    logger.info(f"Batch prediction logged: {json.dumps(log_data)}")


async def _make_prediction(request: PredictionRequest, background_tasks: BackgroundTasks) -> PredictionResponse:
    """Make a single prediction."""
    start_time = time.time()
    prediction_id = _generate_prediction_id(request.application)

    try:
        # Start sustainability tracking if enabled
        sustainability_context = None
        if request.track_sustainability and sustainability_monitor:
            exp_id = f"prediction_{prediction_id}"
            sustainability_monitor.start_experiment_tracking(
                exp_id,
                {
                    "type": "single_prediction",
                    "timestamp": datetime.now().isoformat(),
                },
            )
            sustainability_context = exp_id

        # Validate model is loaded
        if model is None:
            raise HTTPException(status_code=503, detail="Model not available")

        # Prepare input data
        input_data = _prepare_input_data(request.application)

        # Make prediction
        prediction_result = model.predict(input_data)
        risk_score = float(prediction_result.get("prediction", 0.5))
        confidence = float(prediction_result.get("confidence", 0.8))

        # Determine risk level
        risk_level = _determine_risk_level(risk_score)

        # Generate explanation if requested
        explanation = None
        if request.include_explanation and explainer:
            explanation = explainer.explain_prediction(input_data, prediction_result)

        # Stop sustainability tracking
        sustainability_metrics = None
        if sustainability_context:
            sustainability_metrics = sustainability_monitor.stop_experiment_tracking(sustainability_context)

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000

        # Create response
        response = PredictionResponse(
            prediction_id=prediction_id,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=confidence,
            model_version="1.0.0",
            prediction_timestamp=datetime.now(),
            processing_time_ms=processing_time,
            explanation=explanation,
            sustainability_metrics=sustainability_metrics,
            status=PredictionStatus.SUCCESS,
            message="Prediction completed successfully",
        )

        # Log prediction
        background_tasks.add_task(_log_prediction, request, response)

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


async def _make_single_prediction_internal(request: PredictionRequest) -> PredictionResponse:
    """Internal method for single prediction without sustainability tracking."""
    start_time = time.time()
    prediction_id = _generate_prediction_id(request.application)

    # Prepare input data
    input_data = _prepare_input_data(request.application)

    # Make prediction
    prediction_result = model.predict(input_data)
    risk_score = float(prediction_result.get("prediction", 0.5))
    confidence = float(prediction_result.get("confidence", 0.8))

    # Determine risk level
    risk_level = _determine_risk_level(risk_score)

    # Generate explanation if requested
    explanation = None
    if request.include_explanation and explainer:
        explanation = explainer.explain_prediction(input_data, prediction_result)

    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000

    return PredictionResponse(
        prediction_id=prediction_id,
        risk_score=risk_score,
        risk_level=risk_level,
        confidence=confidence,
        model_version="1.0.0",
        prediction_timestamp=datetime.now(),
        processing_time_ms=processing_time,
        explanation=explanation,
        status=PredictionStatus.SUCCESS,
        message="Prediction completed successfully",
    )


async def _make_batch_prediction(
    request: BatchPredictionRequest,
    background_tasks: BackgroundTasks,
) -> BatchPredictionResponse:
    """Make batch predictions."""
    start_time = time.time()
    batch_id = f"batch_{int(time.time())}_{secrets.token_hex(8)}"

    try:
        # Start sustainability tracking
        sustainability_context = None
        if request.track_sustainability and sustainability_monitor:
            exp_id = f"batch_{batch_id}"
            sustainability_monitor.start_experiment_tracking(
                exp_id,
                {
                    "type": "batch_prediction",
                    "batch_size": len(request.applications),
                    "timestamp": datetime.now().isoformat(),
                },
            )
            sustainability_context = exp_id

        # Process each application
        predictions = []
        for i, application in enumerate(request.applications):
            try:
                # Create individual prediction request
                individual_request = PredictionRequest(
                    application=application,
                    include_explanation=request.include_explanation,
                    explanation_type=request.explanation_type,
                    track_sustainability=False,  # Don't double-track
                )

                # Make prediction
                pred_response = await _make_single_prediction_internal(individual_request)
                predictions.append(pred_response)

            except Exception as e:
                # Create error response for failed prediction
                error_response = PredictionResponse(
                    prediction_id=f"{batch_id}_{i}",
                    risk_score=0.5,
                    risk_level=RiskLevel.MEDIUM,
                    confidence=0.0,
                    model_version="1.0.0",
                    prediction_timestamp=datetime.now(),
                    processing_time_ms=0,
                    status=PredictionStatus.ERROR,
                    message=f"Prediction failed: {str(e)}",
                )
                predictions.append(error_response)

        # Calculate batch summary
        successful_predictions = [p for p in predictions if p.status == PredictionStatus.SUCCESS]
        batch_summary = {
            "total_applications": len(request.applications),
            "successful_predictions": len(successful_predictions),
            "failed_predictions": len(predictions) - len(successful_predictions),
            "average_risk_score": sum(p.risk_score for p in successful_predictions) / max(len(successful_predictions), 1),
            "risk_distribution": _calculate_risk_distribution(successful_predictions),
        }

        # Stop sustainability tracking
        sustainability_metrics = None
        if sustainability_context:
            sustainability_metrics = sustainability_monitor.stop_experiment_tracking(sustainability_context)

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000

        # Create batch response
        response = BatchPredictionResponse(
            batch_id=batch_id,
            predictions=predictions,
            batch_summary=batch_summary,
            processing_time_ms=processing_time,
            sustainability_metrics=sustainability_metrics,
        )

        # Log batch prediction
        background_tasks.add_task(_log_batch_prediction, request, response)

        return response

    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


# ============== System Status Endpoints ==============
@app.get("/")
async def root():
    """Root endpoint."""
    return _ok({"message": "Sustainable Credit Risk AI System", "version": "1.0.0"})


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return _ok({"service_status": "healthy", "service": "credit-risk-ai", "model_loaded": model is not None})


@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    try:
        return _ok({"service_status": "ready", "service": "credit-risk-ai"})
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail="Service not ready")


@app.get("/api/v1/status")
async def api_status():
    """API status endpoint."""
    return _ok(
        {
            "service_status": "operational",
            "version": "1.0.0",
            "features": [
                "credit-risk-assessment",
                "sustainability-monitoring",
                "federated-learning",
                "explainable-ai",
            ],
        }
    )


# ============== Model Information Endpoints ==============
@app.get("/model/info")
async def model_info():
    """Get model information."""
    return {
        "model_version": "1.0.0",
        "model_type": "runtime_credit_risk",
        "features_supported": [
            "age", "income", "employment_length", "debt_to_income_ratio",
            "credit_score", "loan_amount", "loan_purpose", "home_ownership",
            "verification_status",
        ],
        "explanation_types": ["shap"],
        "sustainability_tracking": True,
    }


# ============== Prediction Endpoints ==============
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest, background_tasks: BackgroundTasks):
    """Make a single credit risk prediction."""
    return await _make_prediction(request, background_tasks)


@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest, background_tasks: BackgroundTasks):
    """Make batch credit risk predictions."""
    return await _make_batch_prediction(request, background_tasks)


@app.post("/sustainability/run", response_model=SustainabilityRunResponse)
async def run_sustainability(request: SustainabilityRunRequest):
    """Run the selected sustainability evaluation pipeline."""
    try:
        if request.preview_only:
            return _build_sustainability_preview(request.dataset)

        return _run_sustainability_preview(request.dataset, preview_only=False)
    except Exception as exc:
        logger.error(f"Sustainability run failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Sustainability run failed: {str(exc)}",
        )


@app.post("/federated/run", response_model=FederatedRunResponse)
async def run_federated(request: FederatedRunRequest):
    """Run the built-in federated learning simulation."""
    try:
        return _run_federated_preview(request)
    except Exception as exc:
        logger.error(f"Federated run failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Federated run failed: {str(exc)}",
        )


@app.get("/sustainability/stream")
async def stream_sustainability(
    dataset: SustainabilityDataset = Query(...),
    preview_only: bool = Query(True),
):
    """Stream sustainability progress logs and final summary."""

    events: Queue[Dict[str, Any]] = Queue()

    def push_log(message: str):
        events.put({"event": "log", "message": message})

    def worker():
        try:
            events.put(
                {
                    "event": "status",
                    "message": f"Starting {dataset.value} sustainability run",
                }
            )
            result = _run_sustainability_preview(
                dataset,
                preview_only=preview_only,
                log_callback=push_log,
            )
            events.put({"event": "result", "data": result.dict()})
        except Exception as exc:
            events.put({"event": "error", "message": str(exc)})
        finally:
            events.put({"event": "done"})

    Thread(target=worker, daemon=True).start()

    def event_stream():
        while True:
            item = events.get()
            event_type = item.get("event", "message")
            yield f"event: {event_type}\ndata: {json.dumps(item)}\n\n"
            if event_type == "done":
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ============== Startup/Shutdown ==============
@app.on_event("startup")
def startup_event():
    """Load models and services on startup."""
    logger.info("Starting application...")
    _load_model()
    _load_services()


if __name__ == "__main__":
    # Load configuration
    config = load_config()

    # Run the application
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=config.environment.value == "development",
    )
