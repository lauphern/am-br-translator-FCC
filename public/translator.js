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

  translatorCtrl = (val, translateOption) => {
    this.errorMsgDiv.innerText = "";
    //Check there is text to translate
    if(!val) return this.errorMsgDiv.appendChild(this.createParagraph("Error: No text to translate."));
    //Call the next function depending on the language to translate
    if(translateOption === "american-to-british") return this.amToBr(val);
    else if(translateOption === "british-to-american") return this.brToAm(val);
  }

  amToBr = str => {
    let valArray = str.split(" ");
    //Check there are terms to translate
    //TODO check for hours with another method
    //Make it work for titles and the words at the end of the sentence (.)
    //and for terms that are two words ("only" dictionaries)
    let shouldTranslate = valArray.some(el => el in americanOnly || el in americanToBritishSpelling || el in americanToBritishTitles || !!this.getKey(britishOnly, el));
    if(!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
  }

  brToAm = str => {
    let valArray = str.split(" ");
    let shouldTranslate = valArray.some(el => el in britishOnly || !!this.getKey(americanOnly, el) || !!this.getKey(americanToBritishSpelling, el) || !!this.getKey(americanToBritishTitles, el));
    if(!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
  }

  getKey = (obj, val) => Object.keys(obj).find(key => obj[key] === val);

  translateTime = (time, translateOption) => {
    if(translateOption === "american-to-british") return time.split(":").join(".");
    else if(translateOption === "british-to-american") return time.split(".").join(":");
  }

  getTranslatedStr = () => this.translatedSentenceDiv.innerText;

  addEventListeners = () => {
    //Clear btn
    this.clearBtn.addEventListener("click", this.clear);
    
    //Translate btn
    this.translateBtn.addEventListener("click", () => {
      this.translatorCtrl(this.textArea.value, this.localeSelect.value);
    })
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
