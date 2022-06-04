// ------------------------------------
// ボタンクリック時のイベント
// ------------------------------------
const bookDownloadBtn = document.getElementById("bookDownloadBtn");
bookDownloadBtn.addEventListener("click", {name:'book', handleEvent:downloadFile})

const testDownloadBtn = document.getElementById("testDownloadBtn");
testDownloadBtn.addEventListener("click", {name:'test', handleEvent:downloadFile})

function downloadFile(){

    // 入力の受け取り
    
    if(this.name == 'book'){
        downloadCsv(csvData, 'book')
    } else {
        downloadCsv(csvData, 'test')
    }
    // 変換処理実行
    //const csvString = convertJsonToCsv(validatedInput);
    //makeCSVDownloadable(csvString);
    //const csvArray = csvConvertArray(csvString);
    //csvTable.innerHTML = createTableContent(csvArray);
}

// ------------------------------------
// ファイル選択（ドラック＆ドロップ）
// ------------------------------------
document.getElementById('dropAreaBook').addEventListener('dragover', function () {
	event.preventDefault();
	this.style.backgroundColor = '#6088C6';
});
document.getElementById('dropAreaBook').addEventListener('dragleave', function () {
	this.style.backgroundColor = '';
});
document.getElementById('dropAreaBook').addEventListener('drop', function () {
	event.preventDefault();
	this.style.backgroundColor = '';
	if (event.dataTransfer.files.length > 0) {
		document.getElementById('bookFile').files = event.dataTransfer.files;
		document.getElementById('bookFile').dispatchEvent(new Event('change'));
	}
});

document.getElementById('dropAreaTest').addEventListener('dragover', function () {
	event.preventDefault();
	this.style.backgroundColor = '#6088C6';
});
document.getElementById('dropAreaTest').addEventListener('dragleave', function () {
	this.style.backgroundColor = '';
});
document.getElementById('dropAreaTest').addEventListener('drop', function () {
	event.preventDefault();
	this.style.backgroundColor = '';
	if (event.dataTransfer.files.length > 0) {
		document.getElementById('testFile').files = event.dataTransfer.files;
		document.getElementById('testFile').dispatchEvent(new Event('change'));
	}
});

// ------------------------------------
// ファイル選択
// ------------------------------------
const bookFile = document.getElementById("bookFile");
bookFile.addEventListener('change', importBookFile);

const testFile = document.getElementById("testFile");
testFile.addEventListener('change', importTestFile);

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
let csvData = []

function importBookFile() {
    importFile('book')
}

function importTestFile(){
    importFile('test')
}

function importFile(type){
    let reader = new FileReader();
    if(type == 'book'){
        var file = bookFile.files[0];
    } else {
        var file = testFile.files[0];
    }
    reader.readAsText(file)
    reader.onload = function(event){
        let result = event.target.result
        let array = convertArray(result)  //both book and test
        csvData = convertCsv(array, type)
    }
}

const fileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

function returnFileSize(number) {
    if(number < 1024) {
        return number + 'bytes';
    } else if(number >= 1024 && number < 1048576) {
        return (number/1024).toFixed(1) + 'KB';
    } else if(number >= 1048576) {
        return (number/1048576).toFixed(1) + 'MB';
    }
}


// ------------------------------------
// CSV変換
// ------------------------------------
function convertArray(data) {
    let array = []
    let line = data.split("\n")

    for(var i = 0; i < line.length; i++){
        //空白行が出てきた時点で終了
        if(line[i] == '') break;
        array[i] = line[i].split(',');

        for(var i2 = 0; i2 < array[i].length; i2++){
            if(array[i][i2].match("\r")){
                array[i][i2] = array[i][i2].replace('\r', '');
            }
        }
    }
    return array
}

//GASから転記
const indexBook = {
    SUBTITLE: 0,
    TITLE: 1,
    ICONIMAGE:2,
    DESCRIPTION: 3,
    ENTRY_TYPE:4,
    QUESTION: 5,
    ANSWER: 6,
    CHOICE_1: 7,
    CHOICE_2: 8,
    CHOICE_3: 9,
    CHOICE_4: 10,
    CHOICE_5: 11,
    FILENAME: 12,
    EXPLANATION: 13,
    EXPLANATION_FILE: 14,
    CHOICEONLY: 15
}

const indexTest = {
    TITLE: 0,
    DESCRIPTION: 1,
    ENTRY_TYPE:2,
    QUESTION: 3,
    ANSWER: 4,
    CHOICE_1: 5,
    CHOICE_2: 6,
    CHOICE_3: 7,
    CHOICE_4: 8,
    CHOICE_5: 9,
    FILENAME: 10,
    EXPLANATION: 11,
    EXPLANATION_FILE :12,
    SCORE: 13
  }

function convertCsv(array, type) {
  let cList = []
  let csv = []
  if(type == 'book'){
    cList = getBookIndex(array)
  } else {
    cList = getTestIndex(array)
  }

  array.shift()
  let entryNumDict = getTitle(array, cList, type)

  if(type == 'book'){
    csv = insertBookContext(array, entryNumDict, cList)
  } else {
    csv = insertTestContext(array, entryNumDict, cList)
  }
  return csv
}

function downloadCsv(dat, type){
  let fileName = 'sample'
  let csv = dat.join('\n');

  let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let file = new Blob([bom,csv],  {type: "text/csv;charset=utf-8"});
  if(type == 'book'){
    var btn = document.getElementById('bookDownloadBtn');      
  } else {
    var btn = document.getElementById('testDownloadBtn');      
  }
  btn.download = fileName
  btn.href = URL.createObjectURL(file);  
}

function getBookIndex(dat){
  var indexList = [
    dat[0].indexOf('サブタイトル'),
    dat[0].indexOf('タイトル'),
    dat[0].indexOf('アイコン画像'),
    dat[0].indexOf('概要'),
    dat[0].indexOf('問題形式'),
    dat[0].indexOf('問題文'),
    dat[0].indexOf('解答'),
    dat[0].indexOf('選択肢1'),
    dat[0].indexOf('選択肢2'),
    dat[0].indexOf('選択肢3'),
    dat[0].indexOf('選択肢4'),
    dat[0].indexOf('選択肢5'),
    dat[0].indexOf('画像'),
    dat[0].indexOf('解説'),
    dat[0].indexOf('解説画像'),
    dat[0].indexOf('択一のみ')
  ]
  return indexList
}

function getTestIndex(dat){
    let indexList = [
      dat[0].indexOf('タイトル'),
      dat[0].indexOf('概要'),
      dat[0].indexOf('問題形式'),
      dat[0].indexOf('問題文'),
      dat[0].indexOf('解答'),
      dat[0].indexOf('選択肢1'),
      dat[0].indexOf('選択肢2'),
      dat[0].indexOf('選択肢3'),
      dat[0].indexOf('選択肢4'),
      dat[0].indexOf('選択肢5'),
      dat[0].indexOf('画像'),
      dat[0].indexOf('解説'),
      dat[0].indexOf('解説画像'),
      dat[0].indexOf('配点'),
    ]    
    return indexList
  }

function getTitle(dat, cList, type){
    let entryNumDict = {}

    //var _ = Underscore.load();
    let datTrans = transpose(dat)
    let titleArry = []
    if(type == 'book'){
        titleArry = datTrans[cList[indexBook.TITLE]] 
    } else {
        titleArry = datTrans[cList[indexTest.TITLE]] 
    }
    titleArry = titleArry.filter(
            function(value, index, self){
                return self.indexOf(value) === index;
            });

    for(let key of titleArry){
        if(type == 'book'){
            entryNumDict[key] = datTrans[cList[indexBook.TITLE]].filter(function(x){return x==key}).length;
        } else {
            entryNumDict[key] = datTrans[cList[indexTest.TITLE]].filter(function(x){return x==key}).length;
        }
    }
    return entryNumDict
}
 
function insertBookContext(dat, dict, cList){
  let choiceOnlyFlag = document.getElementById('BookChoiceOnly');
  var datCSV = []
  var bookTitle = ["title"]
  var description = ["description"]
  var subTitle = ["subTitle"]
  var iconImage = ["iconFileName"]  
  if(choiceOnlyFlag.checked == true){
    var contextBook = ["c", "primaryLang", "jpn", "secondaryLang", "jpn", "entryType", "q", "choiceOnly", "TRUE"]
  } else {
    var contextBook = ["c", "primaryLang", "jpn", "secondaryLang", "jpn", "entryType", "q"]
  }

  for(var title in dict){
    bookTitle.push(title)
    if(cList[indexBook.SUBTITLE] >= 0){
      subTitle.push(dat[0][cList[indexBook.SUBTITLE]])
    }
    if(cList[indexBook.DESCRIPTION] >= 0){
      description.push(dat[0][cList[indexBook.DESCRIPTION]])
    }
    if(cList[indexBook.ICONIMAGE] >= 0){
      iconImage.push(dat[0][cList[indexBook.ICONIMAGE]])
    }

    datCSV.push(subTitle)
    datCSV.push(bookTitle)
    datCSV.push(iconImage)
    datCSV.push(description)
    datCSV.push(contextBook)
    
    for(var j=0; j<dict[title]; j++){

      if(dat[0][cList[indexBook.CHOICEONLY]] && (!choiceOnlyFlag.checked)){
        dat[0].splice(cList[indexBook.CHOICEONLY], 1, "TRUE")
        dat[0].splice(cList[indexBook.CHOICEONLY], 0, "choiceOnly")
      } else {
        if((cList[indexBook.CHOICEONLY] != -1)){
          dat[0].splice(cList[indexBook.CHOICEONLY], 1)
        }
      }          
      if(dat[0][cList[indexBook.EXPLANATION_FILE]]){
        dat[0].splice(cList[indexBook.EXPLANATION_FILE], 0, "explanationFileName")
      } else {
        if((cList[indexBook.EXPLANATION_FILE] != -1)){
          dat[0].splice(cList[indexBook.EXPLANATION_FILE], 1)
        }
      }
      if(dat[0][cList[indexBook.EXPLANATION]]){
        dat[0].splice(cList[indexBook.EXPLANATION], 0, "explanation")
      } else {
        if(cList[indexBook.EXPLANATION] != -1){
          dat[0].splice(cList[indexBook.EXPLANATION], 1)
        }
      }
      if(dat[0][cList[indexBook.FILENAME]]){
        dat[0].splice(cList[indexBook.FILENAME], 0, "fileName")
      } else {
        if(cList[indexBook.FILENAME] != -1){
          dat[0].splice(cList[indexBook.FILENAME], 1)
        }
      }
      dat[0].splice(cList[indexBook.FILENAME], 0, "")
/*
      if(dat[0][cList[indexBook.CHOICE_5]]){
        dat[0].splice(cList[indexBook.CHOICE_5+1], 0, "")
      } 
      if(!dat[0][cList[indexBook.CHOICE_4]]){
        dat[0].splice(cList[indexBook.CHOICE_4], 1)
      }  
      if(!dat[0][cList[indexBook.CHOICE_3]]){
        dat[0].splice(cList[indexBook.CHOICE_3], 1)
      }  
      if(!dat[0][cList[indexBook.CHOICE_2]]){
        dat[0].splice(cList[indexBook.CHOICE_2], 1)
      }
*/  
      dat[0].splice(cList[indexBook.CHOICE_1], 0, "")

      if(cList[indexBook.ENTRY_TYPE] >= 0){
        dat[0].splice(cList[indexBook.ENTRY_TYPE], 1)
      }

      if(cList[indexBook.DESCRIPTION] >= 0){
        dat[0].splice(cList[indexBook.DESCRIPTION],1)
      }
      
      if(cList[indexBook.ICONIMAGE] >= 0){
        dat[0].splice(cList[indexBook.ICONIMAGE],1)
      }

      if(cList[indexBook.TITLE] >= 0){
        dat[0].splice(cList[indexBook.TITLE],1)
      }

      if(cList[indexBook.SUBTITLE] >= 0){
        dat[0].splice(cList[indexBook.SUBTITLE],1)
      }
 
      /*
      var ind = dat[0].indexOf(bookTitle[1])
      if(ind > -1){
        dat[0].splice(ind, 1)
      }
      var ind2 = dat[0].indexOf(description[1])
      if(ind2 > -1){
        dat[0].splice(ind2, 1)
      }
      */

      datCSV.push('"' + dat[0].join('","') + '"')
      dat.shift()
  }
    bookTitle = ["title"]
    description = ["description"]
    subTitle = ["subTitle"]
    iconImage = ["iconFileName"]  

    datCSV.push(["BOOK_END"])

    datCSV.push([""])
  }
  return datCSV
}

function insertTestContext(dat, dict, cList){

    var datCSV = []
    var bookTitle = ["title"]
    var description = ["description"]
    var contextTest = ["c", "primaryLang", "jpn", "secondaryLang", "jpn"]
  
    for(var title in dict){
      bookTitle.push(title)
      if(cList[indexTest.DESCRIPTION] >= 0){
        description.push(dat[0][cList[indexTest.DESCRIPTION]])
      }
  
      datCSV.push(bookTitle)
      datCSV.push(description)
      datCSV.push(contextTest)
      
      for(var j=0; j<dict[title]; j++){
        if(dat[0][cList[indexTest.SCORE]]){
          dat[0].splice(cList[indexTest.SCORE], 0, "score")
        } else {
          if(cList[indexTest.SCORE] != -1){
            dat[0].splice(cList[indexTest.SCORE], 1)
          }
        }        
        if(dat[0][cList[indexTest.EXPLANATION_FILE]]){
          dat[0].splice(cList[indexTest.EXPLANATION_FILE], 0, "explanationFileName")
        } else {
          if(cList[indexTest.EXPLANATION_FILE] != -1){
            dat[0].splice(cList[indexTest.EXPLANATION_FILE], 1)
          }
        } 
        if(dat[0][cList[indexTest.EXPLANATION]]){
          dat[0].splice(cList[indexTest.EXPLANATION], 0, "explanation")
        } else {
          if(cList[indexTest.EXPLANATION] != -1){
            dat[0].splice(cList[indexTest.EXPLANATION], 1)
          }
        }
        if(dat[0][cList[indexTest.FILENAME]]){
          dat[0].splice(cList[indexTest.FILENAME], 0, "fileName")
        } else {
          if(cList[indexTest.FILENAME] != -1){
            dat[0].splice(cList[indexTest.FILENAME], 1)
          }
        }

        dat[0].splice(cList[indexTest.FILENAME], 0, "")
        dat[0].splice(cList[indexTest.CHOICE_1], 0, "")

        if((dat[0][cList[indexTest.ENTRY_TYPE]] == "選択問題")){
          dat[0].splice(cList[indexTest.ENTRY_TYPE], 1, "ch")
        }

        if(cList[indexTest.DESCRIPTION] >= 0){
          dat[0].splice(cList[indexTest.DESCRIPTION],1)
        }
        if(cList[indexTest.TITLE] >= 0){
          dat[0].splice(cList[indexTest.TITLE],1)
        }
        datCSV.push('"' + dat[0].join('","') + '"')
        dat.shift()
      }

      bookTitle = ["title"]
      description = ["description"]
      datCSV.push(["TEST_END"])
      datCSV.push([""])
    }
    return datCSV
}

// ------------------------------------
// エクセル
// ------------------------------------
//import xlsx from 'xlsx';
//import parse from 'csv-parse';

/** 変換処理実行 */
function convertExcelToCsv(excelFile) {
    let csvArr = [];

    let csv = xlsx.utils.sheet_to_csv(excelFile) // ExcelデータをCSV形式で取得
    parse(csv, {trim: true, skip_empty_lines: true})
      .on('readable', function () {
        let record;
        while (record = this.read()) {
          csvArr.push(record);
        }
      })
      .on('end', () => console.log(csvArr));
}

// ------------------------------------
// CSVテーブルのHTML要素を作成
// ------------------------------------
function CSVテーブルのHTML要素を作成(csvArray) {
    let tableContent = '';
    let isFirst = true;

    csvArray.forEach( (element) => {
        if (isFirst) tableContent+= '<thead>';
        tableContent += '<tr>';

        element.forEach( (childElement) => {
            tableContent += `<td>${childElement}</td>`
        });

        tableContent += '</tr>';

        if (isFirst) {
            tableContent += '</thead>';
            isFirst = false;
        }
    });
    return tableContent;
}
