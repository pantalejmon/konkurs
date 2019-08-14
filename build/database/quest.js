"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var QuestSchema = /** @class */ (function (_super) {
    __extends(QuestSchema, _super);
    function QuestSchema() {
        return _super.call(this, {
            id: {
                type: Number,
                unique: false,
                required: true,
                trim: false
            },
            question: {
                type: String,
                unique: false,
                required: true,
                trim: false
            },
            trueanswer: {
                type: String,
                required: true,
            },
            falseanswer: [{
                    type: String
                }]
        }) || this;
    }
    return QuestSchema;
}(mongoose_1.default.Schema));
var Quest = /** @class */ (function () {
    function Quest() {
        this.quest = mongoose_1.default.model('Quest', new QuestSchema);
    }
    Quest.prototype.getQuestion = function (id) { };
    Quest.prototype.checkAnswer = function (id, answer) { return false; };
    return Quest;
}());
exports.Quest = Quest;
