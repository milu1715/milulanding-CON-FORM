"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRATEGY_GOALS = exports.buildStrategyPrompt = exports.buildNextMovePrompt = void 0;

exports.STRATEGY_GOALS = [
  { id:"rinforzare_organico", labelIT:"Rinforzare Organico", labelEN:"Boost Organic Ranking", description:"Usa il PPC per spingere le vendite e migliorare il ranking organico su keyword chiave" },
  { id:"lancio_aggressivo",   labelIT:"Lancio Aggressivo",   labelEN:"Aggressive Launch",    description:"Massimizza visibilità e prime vendite di un prodotto nuovo, accettando ACOS più alto" },
  { id:"obiettivo_roas",      labelIT:"Obiettivo ROAS",      labelEN:"Target ROAS",          description:"Ottimizza verso un ROAS specifico bilanciando volume e efficienza di spesa" },
  { id:"riduzione_sprechi",   labelIT:"Riduzione Sprechi",   labelEN:"Waste Reduction",      description:"Taglia la spesa inefficiente, aggiungi negative keyword e pausa campagne in perdita" },
  { id:"brand_awareness",     labelIT:"Brand Awareness",     labelEN:"Maximize Impressions", description:"Espandi la presenza del brand massimizzando le impression su keyword di categoria" },
  { id:"custom",              labelIT:"Obiettivo Custom",    labelEN:"Custom Goal",          description:"Descrivi il tuo obiettivo specifico in testo libero per una strategia su misura" },
];

function buildStrategyPrompt(p) {
  const g = exports.STRATEGY_GOALS.find(x => x.id === p.goal) || exports.STRATEGY_GOALS[0];
  const goalDesc = p.goal === "custom"
    ? 'OBIETTIVO CUSTOM: "' + (p.customGoalText || "") + '"'
    : 'OBIETTIVO: ' + g.labelIT + ' (' + g.labelEN + ')\n' + g.description;
  const targets = p.targetMetrics
    ? '\nTARGET METRICHE:\n' +
      (p.targetMetrics.acos != null ? '  ACOS target: ' + (p.targetMetrics.acos*100).toFixed(0) + '%\n' : '') +
      (p.targetMetrics.roas != null ? '  ROAS target: ' + p.targetMetrics.roas.toFixed(2) + 'x' : '')
    : '';
  const history = p.decisionHistory && p.decisionHistory.length
    ? '\nSTORICO DECISIONI:\n' + p.decisionHistory.slice(0,5).map(d =>
        '  [' + new Date(d.createdAt).toLocaleDateString('it-IT') + '] ' + d.title +
        ' — Previsto: "' + d.expectedOutcome + '"' +
        (d.actualOutcome ? ' — Effettivo: "' + d.actualOutcome + '"' : '') +
        ' (stato: ' + d.status + ')'
      ).join('\n')
    : '';

  return 'Sei un esperto Amazon Advertising per seller italiani (brand MiLù Home).\n\nPERFORMANCE ATTUALI:\n' +
    p.reportSummary + targets + history + '\n\n' + goalDesc + '\n\n' +
    'Rispondi SOLO con JSON:\n{\n  "summary": "...",\n  "actions": [{\n    "id": "action_1",\n    "actionType": "bid_increase|bid_decrease|budget_increase|budget_decrease|add_negative_keyword|add_keyword|change_match_type|pause_campaign|enable_campaign|restructure|general",\n    "priority": "critical|high|medium|low",\n    "target": "nome campagna/keyword",\n    "currentValue": "...",\n    "recommendedValue": "...",\n    "reasoning": "...",\n    "expectedImpact": "...",\n    "estimatedEffect": "positive|neutral|risk"\n  }],\n  "nextMove": "...",\n  "targetMetrics": {"acos": 0.25, "roas": 4.0}\n}\n\nMassimo 10 azioni, ordinale per priorità, cita nomi esatti dai dati.';
}
exports.buildStrategyPrompt = buildStrategyPrompt;

function buildNextMovePrompt(p) {
  const hist = p.decisionHistory && p.decisionHistory.length
    ? p.decisionHistory.slice(0,8).map(d =>
        '[' + new Date(d.createdAt).toLocaleDateString('it-IT') + '] ' + d.title +
        ' | ' + d.expectedOutcome + ' | ' + (d.actualOutcome||'non valutato') + ' | ' + d.status
      ).join('\n')
    : 'Nessuna decisione precedente.';
  return 'Sei un esperto Amazon Advertising.\n\nPERFORMANCE:\n' + p.reportSummary +
    '\n\nSTORICO:\n' + hist +
    '\n\nRispondi SOLO con JSON: {"nextMove":"...","reasoning":"...","expectedImpact":"...","priority":"critical|high|medium|low"}';
}
exports.buildNextMovePrompt = buildNextMovePrompt;
