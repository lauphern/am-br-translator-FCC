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

  createSpan = ({obj, time, arr, returnStr = ""}) => {
    //We can use this method with either obj, time and arr
    //"Obj" is for the usual type of translation
    //"Time" is self explanatory
    //"Arr" if to add support for 2 and 3 word terms
    if(time) return `<span class="highlight">${time}</span> `;
    if(arr) {
      if(arr.length === 1) return this.createSpan({obj: arr[0], returnStr: returnStr});
      // if(arr.length === 1) return this.createSpan({obj: arr[0]});
      else if(arr.length > 1) {
        let firstItem = arr.shift();
        return this.createSpan({arr, returnStr: returnStr += this.createSpan({obj: firstItem})});
      }
    }
    if(obj.capitalized) obj.translation = obj.translation.slice(0,1).toUpperCase() + obj.translation.slice(1);
    if(obj.dot) return returnStr += `<span class="highlight">${obj.translation}</span>. `;
    if(obj.comma) return returnStr += `<span class="highlight">${obj.translation}</span>, `;
    if(obj.semicolon) return returnStr += `<span class="highlight">${obj.translation}</span>; `;
    if(obj.colon) return returnStr += `<span class="highlight">${obj.translation}</span>: `;
    if(obj.exclamation) return returnStr += `<span class="highlight">${obj.translation}</span>! `;
    if(obj.question) return returnStr += `<span class="highlight">${obj.translation}</span>? `;
    return returnStr += `<span class="highlight">${obj.translation}</span> `
  };

  clear = () => {
    this.textArea.value = "";
    this.translatedSentenceDiv.innerText = "";
    this.translatedSentenceDiv.textContent = "";
    this.errorMsgDiv.innerText = "";
    this.errorMsgDiv.textContent = "";
  };

  translatorCtrl = (val, translateOption) => {
    this.errorMsgDiv.innerText = "";
    this.translatedSentenceDiv.innerText = "";
    //1. Check there is text to translate
    if (!val) return this.errorMsgDiv.appendChild(this.createParagraph("Error: No text to translate."));
    let valArray = val.split(" ").map(el => this.strToObj(el))
    let timeRegex = /(^\d{1,2}:\d\d$|^\d{1,2}.\d\d$)/;
    //2. Call the next function depending on the language to translate
    if (translateOption === "american-to-british") {
      //3A. Check there are terms to translate
      let shouldTranslate = this.shouldTranslate({arr: valArray, dictionaryArr: [americanOnly, americanToBritishSpelling, americanToBritishTitles, britishOnlyReversed], translateOption: "american-to-british", timeRegex})
      if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
      else if(shouldTranslate){
        this.getTranslation({arr: valArray, dictionaryArr: [americanOnly, americanToBritishSpelling, americanToBritishTitles, britishOnlyReversed], translateOption: "american-to-british", timeRegex});
      }
    } else if (translateOption === "british-to-american") {
      //3B. Check there are terms to translate
      let shouldTranslate = this.shouldTranslate({arr: valArray, dictionaryArr: [britishOnly, americanToBritishSpellingReversed, americanToBritishTitlesReversed, americanOnlyReversed], translateOption: "british-to-american", timeRegex})
      if (!shouldTranslate) return this.translatedSentenceDiv.append(this.createParagraph("Everything looks good to me!"));
      else if(shouldTranslate){
        this.getTranslation({arr: valArray, dictionaryArr: [britishOnly, americanToBritishSpellingReversed, americanToBritishTitlesReversed, americanOnlyReversed], translateOption: "british-to-american", timeRegex});
      }
    };
  };

  shouldTranslate = ({arr, dictionaryArr, translateOption, timeRegex}) => {
    return arr.some(
      el =>
        timeRegex.test(el.cleanStr) ||
        el.cleanStr in dictionaryArr[0] ||
        el.cleanStr in dictionaryArr[1] ||
        el.cleanStr in dictionaryArr[2] ||
        el.cleanStr in dictionaryArr[3] ||
        this.checkMultipleWords(arr, translateOption, 2).length > 0 ||
        this.checkMultipleWords(arr, translateOption, 3).length > 0
    );
  }

  getTranslation = ({arr, dictionaryArr, translateOption, timeRegex}) => {
    let translatedArray = [];
    let i = 0;
    while(i < arr.length) {
      //This if statement is not chained with the rest because it evaluates the whole array
      //and it might return true when arr[i] is not really a match for it
      //so it can't prevent the other if statements from evaluating
      //but it has to come before all, because we need to check for compound terms first (i.e. "installment plan")
      if(this.checkMultipleWords(arr, translateOption, 2).length > 0 || this.checkMultipleWords(arr, translateOption, 3).length > 0){
        //The following variable is used to skip to the next iteration of the while loop
        //We use a variable because the decision is being made from the forEach function
        let doContinue;
        //OPTION B: 2-word term
        let haystack = this.checkMultipleWords(arr, translateOption, 2);
        //TODO refactor
        let needle = !!arr[i+1] ? `${arr[i].cleanStr} ${arr[i+1].cleanStr}`: `${arr[i].cleanStr} ${undefined}`;
        //OPTION A: 2-word term
        let haystack2 = this.checkMultipleWords(arr, translateOption, 3);
        let needle2 = !!arr[i+2]? `${needle} ${arr[i+2].cleanStr}`: `${needle} ${undefined}`;
        //EXECUTE OPTION B
        haystack2.forEach(el => {
          if(el.indexOf(needle2) !== -1) {
            if(needle2 in dictionaryArr[0]) {
              let translationArr = dictionaryArr[0][needle2].split(" ");
              arr[i].translation = translationArr.shift();
              arr[i+1].translation = translationArr.length > 0 ? translationArr.shift() : "";
              arr[i+2].translation = translationArr.length > 0 ? translationArr : "";
              //As we don't always know the word length of the translation
              //It's possible we created empty spans
              //so we're gonna get rid of those before pussing to the array
              //(Same in the next 3 conditional statements)
              let translationStr = this.createSpan({arr: [arr[i], arr[i+1], arr[i+2]]});
              translationStr = translationStr.replace(`<span class="highlight"></span>`, "")
              translatedArray.push(translationStr);
            } else if(needle2 in dictionaryArr[3]) {
              let translationArr = dictionaryArr[3][needle2].split(" ");
              arr[i].translation = translationArr.shift();
              arr[i+1].translation = translationArr.length > 0 ? translationArr.shift() : "";
              arr[i+2].translation = translationArr.length > 0 ? translationArr : "";
              let translationStr = this.createSpan({arr: [arr[i], arr[i+1], arr[i+2]]});
              translationStr = translationStr.replace(`<span class="highlight"></span>`, "")
              translatedArray.push(translationStr);
            }
            i += 3;
            doContinue = true;
          }
        })
        if(doContinue) continue;
        //EXECUTE OPTION A
        haystack.forEach(el => {
          if(el.indexOf(needle) !== -1) {
            if(needle in dictionaryArr[0]) {
              let translationArr = dictionaryArr[0][needle].split(" ");
              arr[i].translation = translationArr.shift();
              arr[i+1].translation = translationArr.length > 0 ? translationArr : "";
              let translationStr = this.createSpan({arr: [arr[i], arr[i+1]]});
              translationStr = translationStr.replace(`<span class="highlight"></span>`, "")
              translatedArray.push(translationStr);
            } else if(needle in dictionaryArr[3]) {
              let translationArr = dictionaryArr[3][needle].split(" ");
              arr[i].translation = translationArr.shift();
              arr[i+1].translation = translationArr.length > 0 ? translationArr : "";
              let translationStr = this.createSpan({arr: [arr[i], arr[i+1]]});
              translationStr = translationStr.replace(`<span class="highlight"></span>`, "")
              translatedArray.push(translationStr);
            }
            i += 2;
            doContinue = true;
          }
        })
        if(doContinue) continue;
        
        
        // translatedArray.push(arr[i].originalStr);
      }
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
      } else {
        translatedArray.push(arr[i].originalStr);
      }
      i++
    }
    //We're using replace to trim possible double spaces
    //And we also trim blankspaces at the end
    return this.translatedSentenceDiv.append(this.createParagraph(translatedArray.join(" ").replace(/\s+/g, " ").trim()));
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
    else if (translateOption === "british-to-american") return time.replace(/\./, ":");
  };

  checkMultipleWords = (arr, translateOption, inc) => {
    let multipleWordArray = [];
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i + 1]) multipleWordArray.push(arr[i]);
      else if (!!arr[i + 1] && !arr[i + 2]) {
        multipleWordArray.push([`${arr[i].cleanStr} ${arr[i + 1].cleanStr}`, arr[i], arr[i + 1]]);
      } else if (inc === 2) {
        multipleWordArray.push([`${arr[i].cleanStr} ${arr[i + 1].cleanStr}`, arr[i], arr[i + 1]]);
      } else if (inc === 3) {
        multipleWordArray.push([`${arr[i].cleanStr} ${arr[i + 1].cleanStr} ${arr[i + 2].cleanStr}`, arr[i], arr[i + 1], arr[i + 2]]);
      }
    };
    if (translateOption === "american-to-british") {
      return multipleWordArray.filter(el => el[0] in americanOnly || el[0] in britishOnlyReversed);
    } else if (translateOption === "british-to-american") {
      return multipleWordArray.filter(el => el[0] in britishOnly || el[0] in americanOnlyReversed);
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