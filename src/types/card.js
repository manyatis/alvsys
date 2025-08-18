"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentInstructionType = exports.CardStatus = void 0;
var CardStatus;
(function (CardStatus) {
    CardStatus["REFINEMENT"] = "REFINEMENT";
    CardStatus["READY"] = "READY";
    CardStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CardStatus["BLOCKED"] = "BLOCKED";
    CardStatus["READY_FOR_REVIEW"] = "READY_FOR_REVIEW";
    CardStatus["COMPLETED"] = "COMPLETED";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
var AgentInstructionType;
(function (AgentInstructionType) {
    AgentInstructionType["GIT"] = "GIT";
    AgentInstructionType["SPIKE"] = "SPIKE";
    AgentInstructionType["CODING"] = "CODING";
    AgentInstructionType["ARCHITECTURE"] = "ARCHITECTURE";
})(AgentInstructionType || (exports.AgentInstructionType = AgentInstructionType = {}));
//# sourceMappingURL=card.js.map