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
    this.translatedSentenceDiv.textContent = "";
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
        !!this.checkMultipleWords(valArray, "american-to-british", 2) ||
        !!this.checkMultipleWords(valArray, "american-to-british", 3)
    );
    if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
    else if(shouldTranslate){
      let translatedArray = [];
      let i = 0;
      while(i < valArray.length) {
        if(timeRegex.test(valArray[i])) translatedArray.push(this.createHighlightedSpan(this.translateTime(valArray[i], "american-to-british")));
        else if(valArray[i] in americanOnly) translatedArray.push(this.createHighlightedSpan(americanOnly[valArray[i]]));
        else if(valArray[i] in americanToBritishSpelling) translatedArray.push(this.createHighlightedSpan(americanToBritishSpelling[valArray[i]]));
        else if(valArray[i] in americanToBritishTitles) translatedArray.push(this.createHighlightedSpan(americanToBritishTitles[valArray[i]]));
        else if(!!this.getKey(britishOnly, valArray[i])) translatedArray.push(this.createHighlightedSpan(this.getKey(britishOnly, valArray[i])));
        else if(!!this.checkMultipleWords(valArray, "american-to-british", 2) || !!this.checkMultipleWords(valArray, "american-to-british", 3)) {
            //TODO refactor
            let haystack = this.checkMultipleWords(valArray, "american-to-british", 2);
            let needle = `${valArray[i]} ${valArray[i+1]}`;
            let haystack2 = this.checkMultipleWords(valArray, "american-to-british", 3);
            let needle2 = `${valArray[i]} ${valArray[i+1]} ${valArray[i+2]}`;
            if(haystack2.indexOf(needle2) !== -1) {
              if(needle2 in americanOnly) translatedArray.push(this.createHighlightedSpan(americanOnly[needle2]));
              else if(!!this.getKey(britishOnly, needle2)) translatedArray.push(this.createHighlightedSpan(this.getKey(britishOnly, needle2)));
              i += 3;
              continue;
            }
            if(haystack.indexOf(needle) !== -1) {
              if(needle in americanOnly) translatedArray.push(this.createHighlightedSpan(americanOnly[needle]))
              else if(!!this.getKey(britishOnly, needle)) translatedArray.push(this.createHighlightedSpan(this.getKey(britishOnly, needle)));
              i += 2;
              continue;
            }
            translatedArray.push(valArray[i]);
          } else translatedArray.push(valArray[i]);
        i++
      }
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
        !!this.checkMultipleWords(valArray, "british-to-american", 2) ||
        !!this.checkMultipleWords(valArray, "british-to-american", 3)
    );
    if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
    else if(shouldTranslate){
      let translatedArray = [];
      let i = 0;
      while(i < valArray.length) {
        if(timeRegex.test(valArray[i])) translatedArray.push(this.createHighlightedSpan(this.translateTime(valArray[i], "british-to-american")));
        else if(valArray[i] in britishOnly) translatedArray.push(this.createHighlightedSpan(britishOnly[valArray[i]]));
        else if(!!this.getKey(americanOnly, valArray[i])) translatedArray.push(this.createHighlightedSpan(this.getKey(americanOnly, valArray[i])));
        else if(!!this.getKey(americanToBritishSpelling, valArray[i])) translatedArray.push(this.createHighlightedSpan(this.getKey(americanToBritishSpelling, valArray[i])));
        else if(!!this.getKey(americanToBritishTitles, valArray[i])) translatedArray.push(this.createHighlightedSpan(this.getKey(americanToBritishTitles, valArray[i])));
        else if(!!this.checkMultipleWords(valArray, "british-to-american", 2) || !!this.checkMultipleWords(valArray, "british-to-american", 3)) {
            //TODO refactor
            let haystack = this.checkMultipleWords(valArray, "british-to-american", 2);
            let needle = `${valArray[i]} ${valArray[i+1]}`;
            let haystack2 = this.checkMultipleWords(valArray, "british-to-american", 3);
            let needle2 = `${valArray[i]} ${valArray[i+1]} ${valArray[i+2]}`;
            if(haystack2.indexOf(needle2) !== -1) {
              if(needle2 in britishOnly) translatedArray.push(this.createHighlightedSpan(britishOnly[needle2]));
              else if(!!this.getKey(americanOnly, needle2)) translatedArray.push(this.createHighlightedSpan(this.getKey(americanOnly, needle2)));
              i += 3;
              continue;
            }
            if(haystack.indexOf(needle) !== -1) {
              if(needle in britishOnly) translatedArray.push(this.createHighlightedSpan(britishOnly[needle]));
              else if(!!this.getKey(americanOnly, needle)) translatedArray.push(this.createHighlightedSpan(this.getKey(americanOnly, needle)));
              i += 2;
              continue;
            }
            translatedArray.push(valArray[i]);
          } else translatedArray.push(valArray[i]);
        i++
      }
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
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i + 1]) multipleWordArray.push(arr[i]);
      else if (!!arr[i + 1] && !arr[i + 2]) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 2) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 3) multipleWordArray.push(`${arr[i]} ${arr[i + 1]} ${arr[i + 2]}`);
    }
    if (translateOption === "american-to-british") {
      return multipleWordArray.filter(el => el in americanOnly || !!this.getKey(britishOnly, el));
    } else if (translateOption === "british-to-american") {
      return multipleWordArray.filter(el => el in britishOnly || !!this.getKey(americanOnly, el));
    }
  };

  getTranslatedStr = () => this.translatedSentenceDiv.textContent;

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