import { processWork } from 'korbit-tutorial-2df972aff2020d81/util.js';

function doSomeWork(workToBeDone: Array<string>) {
    let finishedWork = []
    workToBeDone.forEach((workItem) => finishedWork.push(processWork(workItem)))
    return finishedWork
}

let workToBeDone: Array<string> = ["these", "are", "some", "words", null]
console.log(doSomeWork(workToBeDone))