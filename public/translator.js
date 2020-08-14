import { americanOnly } from './american-only.js';
import { britishOnly } from './british-only.js';
import { americanToBritishSpelling } from './american-to-british-spelling.js';
import { americanToBritishTitles } from './american-to-british-titles.js';

export class Translator {
  constructor() {
    this.textArea = document.querySelector("#text-input");
    this.translatedSentenceDiv = document.querySelector("#translated-sentence");
    this.errorMsgDiv = document.querySelector("#error-msg");
    this.localeSelect = document.querySelector("#locale-select");
    this.translateBtn = document.querySelector("#translate-btn");
    this.clearBtn = document.querySelector("#clear-btn");

    this.addEventListeners();
  }

  createParagraph = str => {
    let p = document.createElement("p");
    p.innerText = str;
    return p;
  }

  createSpan = str => {
    let span = document.createElement("span");
    span.innerText = str;
    return span;
  }

  clear = () => {
    this.textArea.value = "";
    this.translatedSentenceDiv.innerText = "";
    this.errorMsgDiv.innerText = "";
  }

  addEventListeners = () => {
    //Clear btn
    this.clearBtn.addEventListener("click", this.clear);
  }
}

const translator = new Translator();


/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
// try {
//   module.exports = {

//   }
// } catch (e) {}
