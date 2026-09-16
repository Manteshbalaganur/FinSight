import ModelComparisonChart from "@/components/charts/ModelComparisonChart";
import PredictionChart from "@/components/charts/PredictionChart";
import { prediction, modelResults } from "@/lib/mockData";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PredictionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">ML Model Predictions</h1>
        <p className="mt-1 text-sm text-text-muted">Simulated stock price prediction using sentiment-driven models</p>
      </div>

      <div className="rounded-xl border-2 border-profit/50 bg-bg-card p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text-muted">Prediction for</p>
            <p className="text-2xl font-bold text-text-primary">{prediction.stock}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-profit/20">
              <TrendingUp className="text-profit" size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Next-Day Prediction</p>
              <p className="text-xl font-bold text-profit">UP</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-muted">Confidence</p>
            <p className="text-2xl font-bold text-profit tabular-nums">{prediction.confidence}%</p>
          </div>
          <div className="max-w-xs">
            <p className="text-sm text-text-muted">Based on</p>
            <p className="text-sm text-text-primary">{prediction.basedOn}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Model Comparison — Accuracy</h3>
          <ModelComparisonChart />
          <div className="mt-4 space-y-2">
            {modelResults.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span className={cn("font-medium", m.best ? "text-profit" : "text-text-muted")}>
                  {m.name} {m.best && "★ Best"}
                </span>
                <span className="tabular-nums text-text-muted">
                  Accuracy {m.accuracy}% · RMSE {m.rmse}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Predicted vs Actual — Last 30 Days</h3>
          <PredictionChart />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-neutral/30 bg-neutral/10 p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-neutral" size={18} />
        <p className="text-sm text-text-muted">
          Academic prototype — predictions are simulated. Not financial advice.
        </p>
      </div>
    </div>
  );
}
