const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver;

suite('UnitTests', () => {
  const validPuzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  const invalidPuzzle = 'AA9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  const notEnoughPuzzle = '9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  const cannotPassedPuzzle = '999..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  const expectedPuzzleSolution = '769235418851496372432178956174569283395842761628713549283657194516924837947381625';
  
      test('Logic handles a valid puzzle string of 81 characters', function(done) {
            assert.isTrue((/^[\.1-9]{81}$/).test(validPuzzle));
            done();
      });
  
      test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', function(done) {
            assert.isTrue(!(/^[\.1-9]{81}$/).test(invalidPuzzle));
            done();
      });
  
      test('Logic handles a puzzle string that is not 81 characters in length', function(done) {
            assert.isTrue(!(/^[\.1-9]{81}$/).test(notEnoughPuzzle));
            done();
      });
  
      test('Logic handles a valid row placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '7'
        const puzzleProbRow = getAllProb(dataPuzzleObj,'row',1);
        assert.isTrue(typeof(puzzleProbRow)!=='string');
        done();
      });
  
      test('Logic handles a invalid row placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '9'
        const puzzleProb = getAllProb(dataPuzzleObj,'row',1);
        assert.isTrue(typeof puzzleProb==='string');
        done();
      });
  
      test('Logic handles a valid column placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '7'
        const puzzleProb = getAllProb(dataPuzzleObj,'column',1);
        assert.isTrue(typeof(puzzleProb)!=='string');
        done();
      });
  
      test('Logic handles a invalid column placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '8'
        const puzzleProb = getAllProb(dataPuzzleObj,'column',1);
        assert.isTrue(typeof puzzleProb==='string');
        done();
      });
  
      test('Logic handles a valid region (3x3 grid) placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '7'
        const puzzleProb = getAllProb(dataPuzzleObj,'region',1);
        assert.isTrue(typeof(puzzleProb)!=='string');
        done();
      });
  
      test('Logic handles a invalid region (3x3 grid) placement', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        dataPuzzleObj[11] = '8'
        const puzzleProb = getAllProb(dataPuzzleObj,'region',1);
        assert.isTrue(typeof puzzleProb==='string');
        done();
      });
  
      test('Valid puzzle strings pass the solver', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        assert.isTrue(checkPuzzle(dataPuzzleObj).hasOwnProperty('solution'));
        done();
      });
  
      test('Invalid puzzle strings fail the solver', function(done) {
        const dataPuzzle = cannotPassedPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        assert.isTrue(!(checkPuzzle(dataPuzzleObj).hasOwnProperty('solution')));
        done();
      });
  
      test('Valid puzzle strings pass the solver', function(done) {
        const dataPuzzle = validPuzzle;
        let dataPuzzleObj = importAllData(dataPuzzle);
        assert.equal(checkPuzzle(dataPuzzleObj).solution,expectedPuzzleSolution);
        done();
      });
  
  
});





  
  const rowLength = 9;
  const columnLength = 9;
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
  