'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

const rowLength = 9;
const columnLength = 9;
const puzzleRegex = new RegExp(`/[\.1-9]{81}/`)

module.exports = function (app) {
  
  //catch all res
  app.use(function logResponseBody(req, res, next) {
  var oldWrite = res.write,
      oldEnd = res.end;

  var chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);

    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk)
      chunks.push(chunk);

    var body = Buffer.concat(chunks).toString('utf8');
    console.log(`${req.method}: ${req.path} ${JSON.stringify(req.body)} ---> ${body}`);

    oldEnd.apply(res, arguments);
  };

  next();
})
  
  
  
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      if(!req.body.coordinate||!req.body.value||!req.body.puzzle){
        return res.send({error: "Required field(s) missing"})
      };
      if(typeof(req.body.puzzle)!='string'||req.body.puzzle.length!==rowLength*columnLength){
         return res.send({error: 'Expected puzzle to be 81 characters long'})
      }
      if(!(/[\.1-9]{81}/).test(req.body.puzzle)){
         return res.send({error: 'Invalid characters in puzzle'})
      }
      if(typeof(req.body.coordinate)!='string'||!(/^[a-iA-I][1-9]$/).test(req.body.coordinate)){
        return res.send({error: 'Invalid coordinate'});
      }
      if(typeof(req.body.value)!='string'||!(/^[1-9]$/).test(req.body.value)){
        return res.send({error: 'Invalid value'});
      }
      let coordinate = req.body.coordinate.toLowerCase();
      const value = req.body.value;
      const dataPuzzle = req.body.puzzle;
      const coordinateRow = Number(coordinate.charCodeAt(0)-96)
      const coordinateColumn = Number(coordinate[1]);
      const coordinateRegion = ((Math.floor((coordinateRow-1) / 3))*3) + (Math.floor((coordinateColumn-1)/3)+1);
      let dataPuzzleObj = importAllData(dataPuzzle);
      dataPuzzleObj[coordinateRow*10+coordinateColumn] = value;
      const puzzleProbRow = getAllProb(dataPuzzleObj,'row',coordinateRow);
      const puzzleProbColumn = getAllProb(dataPuzzleObj,'column',coordinateColumn);
      const puzzleProbRegion = getAllProb(dataPuzzleObj,'region',coordinateRegion);
      if(typeof puzzleProbRow=='string'||typeof puzzleProbColumn=='string'||typeof puzzleProbRegion=='string'){
        let conflict = [];
        typeof puzzleProbRow=='string' && conflict.push(puzzleProbRow);
        typeof puzzleProbColumn=='string' && conflict.push(puzzleProbColumn);
        typeof puzzleProbRegion=='string' && conflict.push(puzzleProbRegion);
         return res.send({valid:false,conflict})
         }
      res.send({valid:true});
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      if(!req.body.puzzle){return res.send({error:'Required field missing'})};
      if(typeof(req.body.puzzle)!='string'||req.body.puzzle.length!==rowLength*columnLength){
         return res.send({error: 'Expected puzzle to be 81 characters long'})
      }
      if(!(/[\.1-9]{81}/).test(req.body.puzzle)){
         return res.send({error: 'Invalid characters in puzzle'})
      }
      const dataPuzzle = req.body.puzzle;
    let dataPuzzleObj = importAllData(dataPuzzle)
      res.send(checkPuzzle(dataPuzzleObj))
    });
  
  
  
};





  
  const importAllData = function(data){
  const dataArr = data.split('');
  let result = {};
  for (let row = 1; row < rowLength+1; row++){
    for (let column = 1; column < columnLength+1 ; column ++){
      result[(row * 10) + column]=data[((row-1)*9)+(column-1)]==='.'?['1','2','3','4','5','6','7','8','9']:data[((row-1)*9)+(column-1)];
    }
  }
  return result
}

const getAllProb = function(data,type,oneValue){
  if( type!=='row'&&type!=='column'&&type!=='region'){
    return 'no type'
  }
  if( type==='row' ){
    var firstLoop = rowLength;
    var secondLoop = columnLength;
    var rowCount = 10;
    var columnCount = 1;
    var conflictMsg = type;
  }
  if( type==='column' ){
    var firstLoop = columnLength;
    var secondLoop = rowLength;
    var rowCount = 1;
    var columnCount = 10;
    var conflictMsg = type;
  }
  if( type==='region' ){
    var firstLoop = 9;
    var secondLoop = 9;
    var conflictMsg = type;
  }
  let isBreak = false;
  let starti = 1;
  if(oneValue){
    starti = oneValue;
    firstLoop = oneValue;
  }
  loop: for (let i = starti; i< firstLoop+1 ;i++){
    let prob = ['1','2','3','4','5','6','7','8','9'];
    for (let j = 1; j < secondLoop+1 ; j ++){
      var loc = type!=='region'
        ?(i*rowCount)+(j*columnCount)
        :((((Math.floor((i-1)/3))*30) + (((i-1)%3)*3)) + (((Math.floor((j-1)/3)+1)*10) + ((j-1)%3)+1));
      if(!Array.isArray(data[loc])){
        if(prob.includes(data[loc])){
          prob.splice(prob.indexOf(data[loc]),1);
        }else{
          isBreak = true;
          break loop;
        }
      }
    }
    for (let j = 1; j < secondLoop+1 ; j ++){
      var loc = type!=='region'
        ?(i*rowCount)+(j*columnCount)
        :((((Math.floor((i-1)/3))*30) + (((i-1)%3)*3)) + (((Math.floor((j-1)/3)+1)*10) + ((j-1)%3)+1));
      if(Array.isArray(data[loc])){
        data[loc]=data[loc].filter(item1=>{
          return prob.some(item2=>{return item1===item2});
        })
      }
    }
  }
  return isBreak?conflictMsg:data;
}

const compareAllProb = function(data1,data2,data3){
  let result=data1;
  for( let i in data1 ){
    if(Array.isArray(data1[i])){
      result[i] = data1[i].filter(item1=>{
        return data2[i].some(item2=>{return item1===item2;})
      })
      result[i] = result[i].filter(item1=>{
        return data3[i].some(item3=>{return item1===item3;})
      })
      if(result[i].length === 1){result[i]=result[i][0]}
    }
  }
  return result
}

const checkPuzzle = function(data){
  let currentPuzzle = data;
  let probRow,probColumn,probRegion,lastPuzzle;
  let a=0;
  do{
    lastPuzzle = {...currentPuzzle}
    probRow = getAllProb(currentPuzzle,'row');
    probColumn = getAllProb(currentPuzzle,'column');
    probRegion = getAllProb(currentPuzzle,'region');
    if(typeof probRow=='string'||typeof probColumn=='string'||typeof probRegion=='string'){
       return {error:'Puzzle cannot be solved'};
        break;
       }
    currentPuzzle = compareAllProb(probRow,probColumn,probRegion);
    a=a+1;
    if(deepEqual(lastPuzzle,currentPuzzle)){
      loop1: for(let j = 2; j < 10; j++){
        loop2: for( let i in currentPuzzle){
          if(Array.isArray(currentPuzzle[i]) && currentPuzzle[i].length===j){
            currentPuzzle[i] = currentPuzzle[i][0];
            break loop1;
          }
        }
      }
    }
    //console.log(currentPuzzle);
  }while(Object.values(currentPuzzle).some(item=>Array.isArray(item))&&a<999)
  console.log('step:'+a);
  currentPuzzle={solution:Object.values(currentPuzzle).join('')}
  return currentPuzzle;
}

function deepEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepEqual(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }
  return true;
}
function isObject(object) {
  return object != null && typeof object === 'object';
}
  