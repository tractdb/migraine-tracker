import {Component, Type} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// import { Chart } from 'chart.js';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import * as moment from "moment";
import _date = moment.unitOfTime._date;
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";

/**
 * Generated class for the DataVisPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-data-vis',
  templateUrl: 'data-vis.html',
})
export class DataVisPage {
  // @ViewChild('barChart') barChart;
  // @ViewChild('lineChart') lineChart;

  allTrackedData = [];
  currentGoals = {};

  allOverTimeGoals = ["Learn how frequently I get migraines",
                               "Monitoring my migraines",];
  allBeforeAfterGoals = ["Learn whether a specific change affects my migraines"]
  allCorrelationVisGoals = ["Learn what factors may affect my migraines",
                              "Predicting future migraines"];

  currentOverTimeGoals = [];
  currentBeforeAfterGoals = [];
  currentCorrelationGoals = [];

  dates:_date[] = [];
  symptoms:boolean[] = [];
  triggers:any = {};
  treatments:any = {};

  correlationCharts = {'title': 'Trends in Triggers and Treatments', 'charts': []};
  beforeAfterCharts = {'title': 'Trends Since Making a Change', 'charts': []};
  overTimeCharts = {'title': 'Trends Over Time', 'charts': []};


  allCurrentCharts = [this.beforeAfterCharts, this.overTimeCharts, this.correlationCharts];

  chartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1,
        }
      }],
      xAxes: [{
        ticks: {
          maxTicksLimit: 10,
          beginAtZero: true,
          precision: 0,
          autoSkip: false,
        }
      }]
    }
  };

  chartColors = [{ // dark grey
    backgroundColor: '#547688',
    borderColor: '#547688',
    pointBackgroundColor: '#547688',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#547688'
  }];


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public globalFuns: GlobalFunctionsServiceProvider,
              public dateFuns: DateFunctionServiceProvider) {
  }




  makeChartsOverTime(){


  }

  makeBeforeAfterCharts(){

  }


  accumulateData(dataType){
    let dataDict = {};

    for(let i=0; i<dataType['data'].length; i++){
      let dataVal = dataType['data'][i];
      if(dataVal in dataDict){
        dataDict[dataVal] += (this.symptoms[i] ? 1 : 0);
      }
      else{
        dataDict[dataVal] = (this.symptoms[i] ? 1 : 0);
      }
    }
    return dataDict;
  }


  makeCorrelationChart(dataType, name){
    let field = dataType['field'];
    let dateFuns = this.dateFuns;

    if(field === 'category scale' || field === 'binary' || field === 'numeric scale'){
      let accumulatedData = this.accumulateData(dataType);
      let labels = Object.keys(accumulatedData),
        data = [];
      for(let j=0; j<labels.length; j++){
        data.push(accumulatedData[labels[j]]);
      }
      var nullIndex = labels.indexOf("null");
      if (nullIndex !== -1) {
        labels[nullIndex] = '(Not Reported)'; // maybe just remove?
      }

      this.correlationCharts.charts.push(
        {'title': name,
          'labels': labels,
          'data': [{'data': data}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'bar'
        });

    }
    else if(field === 'number'){
      let accumulatedData = this.accumulateData(dataType);
      let labels = Object.keys(accumulatedData),
          data = [];
      for(let j=0; j<labels.length; j++){
        data.push(accumulatedData[labels[j]]);
      }
      let filteredLabels = labels.filter(function (el) { // gets rid of nulls
        return (el != "null" && el!=null);
      });
      let numericLabels = filteredLabels.map(Number); // needed to get min and max

      let scatterData = [];

      // they ignore points for which they don't have labels.  So not having an 8 means it's just skipped
      for(let i=Math.min.apply(Math, numericLabels); i<Math.max.apply(Math, numericLabels)+1; i++){
        let oldIndex = labels.indexOf(String(i));
        let newData = null;
        if(oldIndex > -1){
          newData = data[oldIndex];
        }
        scatterData.push({'x': i, 'y': newData})
      }

      this.correlationCharts.charts.push(
        {'title': name,
          'data': [{'data': scatterData}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'scatter',
        });

    }
    else if(field === 'time'){

      dataType.data = dataType.data.map(function(unformattedTime){
        if(unformattedTime === null){
          return '(Not Reported)';
        }
        let time = dateFuns.getTime(unformattedTime);
        let timeString = time.format('ha');
        time.add(1, 'hour');
        return timeString + '--' + time.format('ha');
      });

      let accumulatedData = this.accumulateData(dataType);
      let labels = Object.keys(accumulatedData),
          data = [];

      labels.sort(function(time1, time2){
        if(time1 === '(Not Reported)'){
          return 1;
        }
        if(time2==='(Not Reported)'){
          return -1;
        }
        let time1Time = time1.split("--")[0],
            time2Time = time2.split("--")[0];

        time1Time = time1Time.substring(0, time1Time.length-1);
        time2Time = time2Time.substring(0, time2Time.length-1);

        let time1Hour = time1Time.substring(0, time1Time.length-1),
            time1Period = time1Time.substring(time1Time.length-1, time1Time.length),
            time2Hour = time2Time.substring(0, time2Time.length -1),
            time2Period = time2Time.substring(time2Time.length -1, time2Time.length);
        if(time1Period === 'a' && time2Period === 'p'){
          return -1;
        }
        if(time2Period === 'a' && time1Period === 'p'){
          return 1;
        }
        return Number(time1Hour) > Number(time2Hour) ? 1 : -1;
      });

      for(let j=0; j<labels.length; j++){
        data.push(accumulatedData[labels[j]]);
      }

      this.correlationCharts.charts.push(
        {'title': name,
          'labels': labels,
          'data': [{'data': data}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'bar'
        });

    }
    else if(field === 'time range'){ // just make it a duration
      dataType.data = dataType.data.map(function(timeDict){
        if(timeDict === null){
          return '(Not Reported)';
        }
        return dateFuns.getDuration(timeDict['start'], timeDict['end']);
      });

      let accumulatedData = this.accumulateData(dataType);
      let labels = Object.keys(accumulatedData);
      labels.sort(function(d1, d2){
        if(d1 === '(Not Reported)'){
          return 1;
        }
        if(d2==='(Not Reported)'){
          return -1;
        }
        return Number(d1) > Number(d2) ? 1 : -1;
      });

      console.log(labels);

      let scatterData = [];
      let newLabels = [];
      for(let j=0; j<labels.length; j++){
        scatterData.push({'x': Number(labels[j]),
                          'y': accumulatedData[labels[j]]});
        if(labels[j]!=='(Not Reported)'){
          newLabels.push(dateFuns.milisecondsToTime(Number(labels[j])));
        }
        else{
          newLabels.push('(Not Reported)');
        }
      }

      console.log(scatterData);
      console.log(newLabels);

      this.correlationCharts.charts.push(
        {'title': name,
          'labels': newLabels,
          'data': [{'data': scatterData, 'showLine': false}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'line',
        });

    }
    else{
      console.log("Field not supported" + field);
    }

  }

  makeCorrelationCharts(dataDict){
    let dataTypes = Object.keys(dataDict);
    for (let i=0; i<dataTypes.length; i++){
      this.makeCorrelationChart(dataDict[dataTypes[i]], dataTypes[i])
    }
  }

  makeAllCharts(){
    if(this.currentOverTimeGoals.length > 0){
      this.makeChartsOverTime();
    }
    if(this.currentBeforeAfterGoals.length > 0){
      this.makeBeforeAfterCharts();
    }
    if(this.currentCorrelationGoals.length > 0){
      this.makeCorrelationCharts(this.triggers);
      this.makeCorrelationCharts(this.treatments);
    }
  }



  addDatapointToDict(dataPoint, dataDict){
    let allDataTypes = Object.keys(dataDict);
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      if(dataType in dataPoint){
        dataDict[dataType]['data'].push(dataPoint[dataType]);
      }
      else{
        dataDict[dataType]['data'].push(null); // so we have the same NUMBER of points each list
      }
    }
  }


  initializeDict(dataDict, currentlyTracking){
    for(let i=0; i<currentlyTracking.length; i++){ // we just want to pay attention to what they currently care about
      let dataInfo = currentlyTracking[i];
      dataDict[dataInfo['name']] = {'data': [], 'field': currentlyTracking[i]['field']}
    }
  }

  organizeData(){
    this.initializeDict(this.treatments, this.currentGoals['dataToTrack']['Treatments']);
    this.initializeDict(this.triggers, this.currentGoals['dataToTrack']['Triggers']);
    for(let i=0; i<this.allTrackedData.length; i++){
      let datapoint = this.allTrackedData[i];
      this.dates.push(datapoint['dateTracked']);
      this.symptoms.push(this.globalFuns.getWhetherMigraine(datapoint['Symptoms']));
      this.addDatapointToDict(datapoint['Treatments'], this.treatments);
      this.addDatapointToDict(datapoint['Triggers'], this.triggers);
    }
    this.makeAllCharts();
  }


  setVisTypes(){
    let goals = this.currentGoals['goals'];
    for(let i=0; i<goals.length; i++){
      let goal = goals[i];
      if(this.allOverTimeGoals.indexOf(goal) > -1){
        this.currentOverTimeGoals.push(goal);
      }
      else if(this.allBeforeAfterGoals.indexOf(goal) > -1){
        this.currentBeforeAfterGoals.push(goal);
      }
      else if(this.allCorrelationVisGoals.indexOf(goal) > -1){
        this.currentCorrelationGoals.push(goal);
      }
    }
    this.organizeData();
  }


  ionViewDidLoad() {
    this.allTrackedData = this.couchDBService.getTrackedData();
    this.currentGoals = this.couchDBService.getActiveGoals();
    this.setVisTypes();
  }



  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

}
