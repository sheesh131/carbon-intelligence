from .carbon_objective import carbon_cost
from .performance_constraints import satisfies_constraints
from .precision_modes import PRECISION_CONFIG
from .scalable_mlp import ScalableMLP

import logging

logger = logging.getLogger(__name__)

# -----------------------------
# Architecture Search Space (expanded for better coverage)
# -----------------------------

SEARCH_SPACE = [
    {"hidden_scale": 1.0},
    {"hidden_scale": 0.85},
    {"hidden_scale": 0.75},
    {"hidden_scale": 0.6},
    {"hidden_scale": 0.5},
    {"hidden_scale": 0.35},
]

EXIT_LEVELS = [1, 2, 3]
PRECISION_MODES = ["fp32", "fp16", "int8"]


# -----------------------------
# Utility
# -----------------------------


def estimate_operation_count(hidden_scale):
    """
    Rough FLOP proxy.
    """
    base_ops = 1000
    return base_ops * hidden_scale


# -----------------------------
# NAS Algorithm
# -----------------------------


def carbon_aware_nas(
    X_tensor,
    y_true,
    reference_metrics,
    preprocessing_latency_ms,
    exit_latencies_ms,
    evaluate_model_fn,
    fallback_top_k=15,
    verbose=False,
    dropout=0.3,
    preview_only=False,
    log_callback=None,
):

    pareto_candidates = []
    all_candidates = []

    search_space = SEARCH_SPACE[:1] if preview_only else SEARCH_SPACE
    exit_levels = EXIT_LEVELS[-1:] if preview_only else EXIT_LEVELS
    precision_modes = PRECISION_MODES if preview_only else PRECISION_MODES

    total_configs = len(search_space) * len(exit_levels) * len(precision_modes)
    current = 0

    if log_callback is not None:
        log_callback(
            f"Starting NAS sweep with {total_configs} candidate configurations"
        )

    for arch in search_space:

        hidden_scale = arch["hidden_scale"]

        for exit_level in exit_levels:
            for precision in precision_modes:
                current += 1
                if verbose:
                    logger.info(
                        "[%s/%s] scale=%s exit=%s precision=%s",
                        current,
                        total_configs,
                        hidden_scale,
                        exit_level,
                        precision,
                    )
                if log_callback is not None:
                    log_callback(
                        f"[{current}/{total_configs}] scale={hidden_scale} exit={exit_level} precision={precision}"
                    )

                model = ScalableMLP(
                    input_dim=X_tensor.shape[1],
                    hidden_scale=hidden_scale,
                    dropout=dropout,
                )

                precision_multiplier = PRECISION_CONFIG[precision][
                    "multiplier"
                ]

                probs, metrics = evaluate_model_fn(
                    model=model,
                    X_tensor=X_tensor,
                    exit_level=exit_level,
                    precision=precision,
                )

                # --------------------
                # Carbon Cost
                # --------------------
                operation_count = estimate_operation_count(hidden_scale)

                cost = carbon_cost(
                    preprocessing_latency_ms,
                    exit_latencies_ms[exit_level],
                    operation_count,
                    precision_multiplier,
                )

                candidate = {
                    "architecture": arch,
                    "exit_level": exit_level,
                    "precision": precision,
                    "metrics": metrics,
                    "carbon_cost": cost,
                }
                candidate["multi_objective_score"] = (
                    (metrics["auc"] * 0.6)
                    + (metrics["ks"] * 0.3)
                    - (metrics["brier"] * 0.1)
                    - (cost * 0.001)
                )

                all_candidates.append(candidate)

                # --------------------
                # Stability Constraints
                # --------------------
                passes = satisfies_constraints(metrics, reference_metrics)
                if passes:
                    pareto_candidates.append(candidate)
                    if verbose:
                        logger.info("AUC=%.4f PASS", metrics["auc"])
                    if log_callback is not None:
                        log_callback(f"AUC={metrics['auc']:.4f} PASS")
                elif verbose:
                    logger.info("AUC=%.4f", metrics["auc"])
                    if log_callback is not None:
                        log_callback(f"AUC={metrics['auc']:.4f}")

    if verbose:
        logger.info("Configurations tested: %s", len(all_candidates))
        logger.info(
            "Configurations passing constraints: %s",
            len(pareto_candidates),
        )

    if log_callback is not None:
        log_callback(f"Configurations tested: {len(all_candidates)}")
        log_callback(
            f"Configurations passing constraints: {len(pareto_candidates)}"
        )

    # Sort by cost
    pareto_candidates.sort(key=lambda x: x["carbon_cost"])
    all_candidates.sort(key=lambda x: x["carbon_cost"])

    if preview_only:
        if pareto_candidates:
            return pareto_candidates

        # Fallback: still return best candidates for inspection when constraints are too strict.
        fallback = all_candidates[:fallback_top_k]
        for candidate in fallback:
            candidate["constraint_violation"] = True

        return fallback

    return all_candidates
