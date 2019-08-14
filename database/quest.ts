import mongoose from 'mongoose';


class QuestSchema extends mongoose.Schema {
    constructor() {
        super({
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
        });
    }
}
export class Quest {
    private quest = mongoose.model('Quest', new QuestSchema);
    constructor() { }
    getQuestion(id: number) { }
    checkAnswer(id: number, answer: String): boolean { return false; }

}