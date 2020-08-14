import { americanOnly } from "./american-only.js";
import { britishOnly } from "./british-only.js";
import { americanToBritishSpelling } from "./american-to-british-spelling.js";
import { americanToBritishTitles } from "./american-to-british-titles.js";

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
    p.innerHTML = str;
    return p;
  };

  createHighlightedSpan = str => `<span class="highlight">${str}</span>`;

  clear = () => {
    this.textArea.value = "";
    this.translatedSentenceDiv.innerText = "";
    this.errorMsgDiv.innerText = "";
  };

  translatorCtrl = (val, translateOption) => {
    this.errorMsgDiv.innerText = "";
    this.translatedSentenceDiv.innerText = "";
    //Check there is text to translate
    if (!val)
      return this.errorMsgDiv.appendChild(this.createParagraph("Error: No text to translate."));
    //Call the next function depending on the language to translate
    if (translateOption === "american-to-british") return this.amToBr(val);
    else if (translateOption === "british-to-american") return this.brToAm(val);
  };

  amToBr = str => {
    let valArray = str.split(" ");
    //Check there are terms to translate
    //TODO
    //Make it work for titles and the words at the end of the sentence (.)
    //regex that matches one dot at the end: /\.{1}$/
    let timeRegex = /^\d\d:\d\d$/;
    //TODO
    //it should be in lowercase to check the dictionaries
    //and if the element is capizalized and it has to be translated, capitalize the return value too
    let shouldTranslate = valArray.some(
      el =>
        timeRegex.test(el) ||
        el in americanOnly ||
        el in americanToBritishSpelling ||
        el in americanToBritishTitles ||
        !!this.getKey(britishOnly, el) ||
        this.checkMultipleWords(valArray, "american-to-british", 2) ||
        this.checkMultipleWords(valArray, "american-to-british", 3)
    );
    if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
    else if(shouldTranslate){
      let translatedArray = valArray.map(el => {
        if(timeRegex.test(el)) return this.createHighlightedSpan(this.translateTime(el, "american-to-british"));
        if(el in americanOnly) return this.createHighlightedSpan(americanOnly[el]);
        if(el in americanToBritishSpelling) return this.createHighlightedSpan(americanToBritishSpelling[el]);
        if(el in americanToBritishTitles) return this.createHighlightedSpan(americanToBritishTitles[el]);
        if(!!this.getKey(britishOnly, el)) return this.createHighlightedSpan(this.getKey(britishOnly, el));
        //TODO
        //lo de multiple words podria ser un problema aqui porque map devuelve el mismo numero
        //de items que el array original
        else return el
      })
      return this.translatedSentenceDiv.append(this.createParagraph(translatedArray.join(" ")));
    }
  };

  brToAm = str => {
    let valArray = str.split(" ");
    let timeRegex = /^\d\d.\d\d$/;
    let shouldTranslate = valArray.some(
      el =>
        timeRegex.test(el) ||
        el in britishOnly ||
        !!this.getKey(americanOnly, el) ||
        !!this.getKey(americanToBritishSpelling, el) ||
        !!this.getKey(americanToBritishTitles, el) ||
        this.checkMultipleWords(valArray, "british-to-american", 2) ||
        this.checkMultipleWords(valArray, "british-to-american", 3)
    );
    if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
    else if(shouldTranslate){
      let translatedArray = valArray.map(el => {
        if(timeRegex.test(el)) return this.createHighlightedSpan(this.translateTime(el, "british-to-american"));
        if(el in britishOnly) return this.createHighlightedSpan(britishOnly[el]);
        if(!!this.getKey(americanOnly, el)) this.createHighlightedSpan(this.getKey(americanOnly, el));
        if(!!this.getKey(americanToBritishSpelling, el)) this.createHighlightedSpan(this.getKey(americanToBritishSpelling, el));
        if(!!this.getKey(americanToBritishTitles, el)) this.createHighlightedSpan(this.getKey(americanToBritishTitles, el));
        //TODO
        //lo de multiple words podria ser un problema aqui porque map devuelve el mismo numero
        //de items que el array original
        else return el
      })
      return this.translatedSentenceDiv.append(this.createParagraph(translatedArray.join(" ")));
    }
  };

  getKey = (obj, val) => Object.keys(obj).find(key => obj[key] === val);

  translateTime = (time, translateOption) => {
    if (translateOption === "american-to-british") return time.split(":").join(".");
    else if (translateOption === "british-to-american") return time.split(".").join(":");
  };

  checkMultipleWords = (arr, translateOption, inc) => {
    let multipleWordArray = [];
    for (let i = 0; i < arr.length; i += inc) {
      if (!arr[i + 1]) multipleWordArray.push(arr[i]);
      else if (!!arr[i + 1] && !arr[i + 2]) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 2) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 3) multipleWordArray.push(`${arr[i]} ${arr[i + 1]} ${arr[i + 2]}`);
    }
    if (translateOption === "american-to-british") {
      return multipleWordArray.some(el => el in americanOnly || !!this.getKey(britishOnly, el));
    } else if (translateOption === "british-to-american") {
      return multipleWordArray.some(el => el in britishOnly || !!this.getKey(americanOnly, el));
    }
  };

  getTranslatedStr = () => this.translatedSentenceDiv.innerText;

  addEventListeners = () => {
    //Clear btn
    this.clearBtn.addEventListener("click", this.clear);

    //Translate btn
    this.translateBtn.addEventListener("click", () => {
      this.translatorCtrl(this.textArea.value, this.localeSelect.value);
    });
  };
}

const translator = new Translator();

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/