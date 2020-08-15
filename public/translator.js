import { americanOnly } from "./american-only.js";
import { britishOnly } from "./british-only.js";
import { americanToBritishSpelling } from "./american-to-british-spelling.js";
import { americanToBritishTitles } from "./american-to-british-titles.js";

//We use reversed dictionaries to simplify the methods we use for translating
let americanOnlyReversed,
    britishOnlyReversed,
    americanToBritishSpellingReversed,
    americanToBritishTitlesReversed;

export class Translator {
  constructor() {
    this.textArea = document.querySelector("#text-input");
    this.translatedSentenceDiv = document.querySelector("#translated-sentence");
    this.errorMsgDiv = document.querySelector("#error-msg");
    this.localeSelect = document.querySelector("#locale-select");
    this.translateBtn = document.querySelector("#translate-btn");
    this.clearBtn = document.querySelector("#clear-btn");

    this.init()
  }

  createParagraph = str => {
    let p = document.createElement("p");
    p.innerHTML = str;
    return p;
  };

  // let obj = {
  //   originalStr: str,
  //   cleanStr: str.toLowerCase(),
  //   capitalized: false,
  //   dot: false,
  //   comma: false,
  //   semicolon: false,
  //   colon: false,
  //   exclamation: false,
  //   question: false
  // };

  createSpan = ({obj, time}) => {
    //We can use this method with either obj or time
    //Obj is for the usual type of translation
    if(time) return `<span class="highlight">${time}</span>`;
    if(obj.capitalized) obj.translation = obj.translation.slice(0,1).toUpperCase() + obj.translation.slice(1);
    if(obj.dot) return `<span class="highlight">${obj.translation}</span>.`;
    if(obj.comma) return `<span class="highlight">${obj.translation}</span>,`;
    if(obj.semicolon) return `<span class="highlight">${obj.translation}</span>;`;
    if(obj.colon) return `<span class="highlight">${obj.translation}</span>:`;
    if(obj.exclamation) return `<span class="highlight">${obj.translation}</span>!`;
    if(obj.question) return `<span class="highlight">${obj.translation}</span>?`;
    return `<span class="highlight">${obj.translation}</span>`;
  };

  clear = () => {
    this.textArea.value = "";
    this.translatedSentenceDiv.innerText = "";
    this.translatedSentenceDiv.textContent = "";
    this.errorMsgDiv.innerText = "";
  };

  translatorCtrl = (val, translateOption) => {
    this.errorMsgDiv.innerText = "";
    this.translatedSentenceDiv.innerText = "";
    //1. Check there is text to translate
    if (!val) return this.errorMsgDiv.appendChild(this.createParagraph("Error: No text to translate."));
    let valArray = val.split(" ").map(el => this.strToObj(el))
    //TODO
    //Make it work for titles and the words at the end of the sentence (.)
    //regex that matches one dot at the end: /\.{1}$/
    let timeRegex = /^\d\d:\d\d$/;
    //TODO
    //it should be in lowercase to check the dictionaries
    //and if the element is capizalized and it has to be translated, capitalize the return value too
    //2. Call the next function depending on the language to translate
    if (translateOption === "american-to-british") {
      //1. Check there are terms to translate
      let shouldTranslate = this.shouldTranslateTemp({arr: valArray, dictionaryArr: [americanOnly, americanToBritishSpelling, americanToBritishTitles, britishOnlyReversed], translateOption: "american-to-british", timeRegex})
      if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
      else if(shouldTranslate){
        this.getTranslationTemp({arr: valArray, dictionaryArr: [americanOnly, americanToBritishSpelling, americanToBritishTitles, britishOnlyReversed], translateOption: "american-to-british", timeRegex});
      }
    } else if (translateOption === "british-to-american") {
      //1. Check there are terms to translate
      let shouldTranslate = this.shouldTranslateTemp({arr: valArray, dictionaryArr: [britishOnly, americanToBritishSpellingReversed, americanToBritishTitlesReversed, americanOnlyReversed], translateOption: "british-to-american", timeRegex})
      if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
      else if(shouldTranslate){
        this.getTranslationTemp({arr: valArray, dictionaryArr: [britishOnly, americanToBritishSpellingReversed, americanToBritishTitlesReversed, americanOnlyReversed], translateOption: "british-to-american", timeRegex});
      }
    };
  };

  shouldTranslateTemp = ({arr, dictionaryArr, translateOption, timeRegex}) => {
    return arr.some(
      el =>
        timeRegex.test(el.cleanStr) ||
        el.cleanStr in dictionaryArr[0] ||
        el.cleanStr in dictionaryArr[1] ||
        el.cleanStr in dictionaryArr[2] ||
        el.cleanStr in dictionaryArr[3] 
        // ||
        // this.checkMultipleWords(arr, translateOption, 2).length > 0 ||
        // this.checkMultipleWords(arr, translateOption, 3).length > 0
    );
  }

  getTranslationTemp = ({arr, dictionaryArr, translateOption, timeRegex}) => {
    let translatedArray = [];
    let i = 0;
    while(i < arr.length) {
      if(timeRegex.test(arr[i].cleanStr)) {
        translatedArray.push(this.createSpan({time: this.translateTime(arr[i].originalStr, translateOption)}));
      } else if(arr[i].cleanStr in dictionaryArr[0]) {
        arr[i].translation = dictionaryArr[0][arr[i].cleanStr];
        translatedArray.push(this.createSpan({obj: arr[i]}));
      } else if(arr[i].cleanStr in dictionaryArr[1]) {
        arr[i].translation = dictionaryArr[1][arr[i].cleanStr];
        translatedArray.push(this.createSpan({obj: arr[i]}));
      } else if(arr[i].cleanStr in dictionaryArr[2]) {
        arr[i].translation = dictionaryArr[2][arr[i].cleanStr];
        translatedArray.push(this.createSpan({obj: arr[i]}));
      } else if(arr[i].cleanStr in dictionaryArr[3]) {
        arr[i].translation = dictionaryArr[3][arr[i].cleanStr];
        translatedArray.push(this.createSpan({obj: arr[i]}));
      }
      // else if(this.checkMultipleWords(arr, translateOption, 2).length > 0 || this.checkMultipleWords(arr, translateOption, 3).length > 0) {
      //     //TODO refactor
      //     let haystack = this.checkMultipleWords(arr, translateOption, 2);
      //     let needle = `${arr[i]} ${arr[i+1]}`;
      //     let haystack2 = this.checkMultipleWords(arr, translateOption, 3);
      //     let needle2 = `${arr[i]} ${arr[i+1]} ${arr[i+2]}`;
      //     if(haystack2.indexOf(needle2) !== -1) {
      //       if(needle2 in dictionaryArr[0]) {
      //         translatedArray.push(this.createSpan(dictionaryArr[0][needle2]));
      //       } else if(needle2 in dictionaryArr[3]) translatedArray.push(this.createSpan(dictionaryArr[3][needle2]));
      //       i += 3;
      //       continue;
      //     }
      //     if(haystack.indexOf(needle) !== -1) {
      //       if(needle in dictionaryArr[0]) {
      //         translatedArray.push(this.createSpan(dictionaryArr[0][needle]))
      //       } else if(needle in dictionaryArr[3]) translatedArray.push(this.createSpan(dictionaryArr[3][needle]));
      //       i += 2;
      //       continue;
      //     }
      //     translatedArray.push(arr[i]);
      //   }
      else {
          translatedArray.push(arr[i].originalStr);
        }
      i++
    }
    return this.translatedSentenceDiv.append(this.createParagraph(translatedArray.join(" ")));
  }

  strToObj = str => {
    let obj = {
      originalStr: str,
      cleanStr: str.toLowerCase(),
      capitalized: false,
      dot: false,
      comma: false,
      semicolon: false,
      colon: false,
      exclamation: false,
      question: false
    };
    if(str.charCodeAt(0) >= 65 && str.charCodeAt(0) <= 90) obj.capitalized = true;
    switch(str.charCodeAt(str.length - 1)) {
      case 46:
        //With this condition we add support for american titles (i.e. Mr.)
        if(americanToBritishTitles[obj.cleanStr]) break;
        obj.dot = true;
        break;
      case 44:
        obj.comma = true;
        break;
      case 59:
        obj.semicolon = true;
        break;
      case 58:
        obj.colon = true;
        break;
      case 33:
        obj.exclamation = true;
        break;
      case 63:
        obj.question = true;
        break;
    }
    if(obj.dot || obj.comma || obj.semicolon || obj.colon || obj.exclamation || obj.question) {
      obj.cleanStr = obj.cleanStr.slice(0, str.length - 1);
    }
    return obj
  }

  translateTime = (time, translateOption) => {
    if (translateOption === "american-to-british") return time.split(":").join(".");
    else if (translateOption === "british-to-american") return time.split(".").join(":");
  };

  checkMultipleWords = (arr, translateOption, inc) => {
    //TODO refactor so it works with an array of objects
    let multipleWordArray = [];
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i + 1]) multipleWordArray.push(arr[i]);
      else if (!!arr[i + 1] && !arr[i + 2]) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 2) multipleWordArray.push(`${arr[i]} ${arr[i + 1]}`);
      else if (inc === 3) multipleWordArray.push(`${arr[i]} ${arr[i + 1]} ${arr[i + 2]}`);
    }
    if (translateOption === "american-to-british") {
      return multipleWordArray.filter(el => el in americanOnly || el in britishOnlyReversed);
    } else if (translateOption === "british-to-american") {
      return multipleWordArray.filter(el => el in britishOnly || el in americanOnlyReversed);
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

  reverseObject = obj => {
    let reversed = {}
    for(let key in obj) {
      reversed[obj[key]] = key
    }
    return reversed
  }

  init = () => {
    this.addEventListeners();
    americanOnlyReversed = this.reverseObject(americanOnly);
    britishOnlyReversed = this.reverseObject(britishOnly);
    americanToBritishSpellingReversed = this.reverseObject(americanToBritishSpelling);
    americanToBritishTitlesReversed = this.reverseObject(americanToBritishTitles);
  }
}

const translator = new Translator();

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/