"use client";

import {
  COMPANIES,
  COMPANY_CATEGORIES,
  DIFFICULTY_TIER_LABELS,
  type CompanyCategory,
} from "@/data/companies";

interface StepCompanyProps {
  selected: string;
  onSelect: (companyId: string) => void;
}

const CATEGORY_ORDER: CompanyCategory[] = [
  "it-services",
  "product",
  "semiconductor",
  "telecom",
  "automotive",
  "defense-psu",
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  "moderate": { bg: "rgba(16,185,129,.15)", text: "#10b981" },
  "tough": { bg: "rgba(245,158,11,.15)", text: "#f59e0b" },
  "very-tough": { bg: "rgba(239,68,68,.15)", text: "#ef4444" },
};

export default function StepCompany({ selected, onSelect }: StepCompanyProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Select Target Company</h2>
        <p className="text-light-100 text-sm">
          AI will tailor questions to match this company's actual interview style
        </p>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const companies = COMPANIES.filter((c) => c.category === category);
        if (!companies.length) return null;

        return (
          <div key={category} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-light-400 uppercase tracking-wider px-1">
              {COMPANY_CATEGORIES[category]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map((company) => {
                const isSelected = selected === company.id;
                const diffStyle = DIFFICULTY_COLORS[company.difficultyTier] ?? DIFFICULTY_COLORS["moderate"];

                return (
                  <button
                    key={company.id}
                    onClick={() => onSelect(company.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                      isSelected
                        ? "border-indigo-500/60 bg-indigo-500/10"
                        : "border-white/10 bg-dark-200 hover:border-white/20 hover:bg-dark-300"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: company.color + "88", backgroundColor: company.color + "11" }
                        : {}
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{company.logo}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4
                            className="font-bold text-sm"
                            style={{ color: isSelected ? company.color : "white" }}
                          >
                            {company.name}
                          </h4>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: diffStyle.bg, color: diffStyle.text }}
                          >
                            {DIFFICULTY_TIER_LABELS[company.difficultyTier]}
                          </span>
                        </div>
                        <p className="text-xs text-light-100 leading-relaxed line-clamp-2">
                          {company.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {company.typicalRounds.slice(0, 2).map((r) => (
                            <span
                              key={r}
                              className="text-xs px-1.5 py-0.5 rounded bg-dark-300 text-light-400"
                            >
                              {r.split("(")[0].trim()}
                            </span>
                          ))}
                          {company.typicalRounds.length > 2 && (
                            <span className="text-xs text-light-400">
                              +{company.typicalRounds.length - 2} more rounds
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
