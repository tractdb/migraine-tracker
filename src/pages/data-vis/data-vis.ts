import {Component} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import * as moment from "moment";
import _date = moment.unitOfTime._date;
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {GoalDetailsServiceProvider} from "../../providers/goal-details-service/goal-details-service";
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";


@Component({
  selector: 'page-data-vis',
  templateUrl: 'data-vis.html',
})
export class DataVisPage {

  allTrackedData : {[trackedData:string]: any;}[] = [];
  currentGoals : {[goalAspect:string]: any} = {};

  dates : _date[] = [];
  symptomBinaryByDate : boolean[] = [];
  dataByType = {};



  correlationCharts : {[chartTypeProps: string ] : any} = {'title': 'Trends in Contributors', 'charts': [],
                                                              'goals': [], 'dataTypes': []};
  beforeAfterCharts : {[chartTypeProps: string ] : any}= {'title': 'Trends Since Making a Change', 'charts': [],
                                                            'goals': [], 'dataTypes': []};
  overTimeCharts : {[chartTypeProps: string ] : any} = {'title': 'Trends Over Time', 'charts': [],
                                                            'goals': [], 'dataTypes': []};


  allCurrentCharts : {[chartTypeProps: string ] : any}[] = [this.beforeAfterCharts,
                                                                this.overTimeCharts, this.correlationCharts];

  chartOptions : {[chartProps: string ] : any} = {
    scaleShowVerticalLines: false,
    responsive: true,
    aspectRatio: 1.5,
    scales: {
      yAxes: [{
        ticks: {
          fontSize: 14,
          fontColor: '#fff',
          beginAtZero: true,
          stepSize: 5,
        }
      }],
      xAxes: [{
        ticks: {
          fontSize: 14,
          fontColor: '#fff',
          maxTicksLimit: 10,
          beginAtZero: true,
          precision: 0,
          autoSkip: false,
          distribution: 'linear'
        }
      }]
    }
  };

  timeOptions = this.makeTimeOptions();

  chartColors : {[chartColorType: string] : string}[] = [{ // library needs it to be a list
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    pointBackgroundColor: '#4A90E2',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    fontColor: '#fff',
    pointHoverBorderColor: '#4A90E2'
  }];


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public goalDetailsService: GoalDetailsServiceProvider,
              public dataDetailsService: DataDetailsServiceProvider,
              public globalFuns: GlobalFunctionsServiceProvider,
              public dateFuns: DateFunctionServiceProvider) {
  }

  makeTimeOptions() : {[chartProps: string ] : any} {
    let chartOptions = this.chartOptions;
    let timeOptions = {'scales': {'xAxes': {}}};

    Object.keys(chartOptions).forEach(function(key) {
      timeOptions[ key ] = chartOptions[ key ];
    });

    timeOptions['scales']['xAxes']['type'] = 'time';
    timeOptions['scales']['xAxes']['distribution'] = 'linear';
    timeOptions['scales']['xAxes']['time'] = {
      displayFormats: {
        day: 'MMM D YY'
      }
    };

    return timeOptions;
  }

  ionViewDidLoad() {
    this.allTrackedData = this.sortByDate(this.couchDBService.getTrackedData());
    this.currentGoals = this.couchDBService.getActiveGoals();
    this.setVisTypes();
  }

  sortByDate(allData : {[trackedData:string]: any;}[]) : {[trackedData:string]: any;}[]{
    allData.sort(function(d1, d2){
      return new Date(d1.startTime) > new Date(d2.startTime) ? 1: -1;
    });
    return allData;
  }


  setVisTypes(){
    let goals = this.currentGoals['goals'];
    for(let i=0; i<goals.length; i++){
      let goal = this.goalDetailsService.getGoalByID(goals[i]);
      let visType = goal['visType'];
      if(visType === 'overTime'){
        this.overTimeCharts['goals'].push(goal.name);
      }
      else if(visType === 'beforeAfter'){
        this.beforeAfterCharts['goals'].push(goal.name);
      }
      else if(visType === 'correlation'){
        this.correlationCharts['goals'].push(goal.name);
      }
      else{
        console.log("Vis not supported: " + visType);
      }
    }
    this.organizeData();
  }


  organizeData(){ // because the chart library apparently can't deal with json-format data, make everything into lists
    let trackedDataTypes = Object.keys(this.currentGoals['dataToTrack']);
    for(let i=0; i<trackedDataTypes.length; i++){ // get the datatypes we're visualizing
      let visTypes = this.dataDetailsService.getConfigByName(trackedDataTypes[i])['visTypes'];
      if(visTypes) {
        this.initializeTrackingDict(trackedDataTypes[i], visTypes);
        if(visTypes.indexOf('overTime')>-1) this.overTimeCharts['dataTypes'].push(trackedDataTypes[i]);
        if(visTypes.indexOf('beforeAfter')>-1) this.beforeAfterCharts['dataTypes'].push(trackedDataTypes[i]);
        if(visTypes.indexOf('correlation')>-1) this.correlationCharts['dataTypes'].push(trackedDataTypes[i]);
      }
    }

    for(let i=0; i<this.allTrackedData.length; i++){ // add the data
      let datapoint = this.allTrackedData[i];
      this.dates.push(datapoint['startTime']);
      this.symptomBinaryByDate.push(this.globalFuns.getWhetherMigraine(datapoint['Symptom'])); // maybe remove
      this.addDatapoint(datapoint);
    }
    this.makeAllCharts();
  }


  initializeTrackingDict(dataType, visTypes){
    this.dataByType[dataType] = {};
      // iterate over currently tracking, not tracked data, b/c we just want what they currently care about
    for(let i=0; i<this.currentGoals['dataToTrack'][dataType].length; i++){
      let dataElement = this.currentGoals['dataToTrack'][dataType][i];
      if(dataElement.field === 'note') continue;
      this.dataByType[dataType][dataElement['id']] = {'data': [], 'field': dataElement['field'],
                    'dataDict':{}, 'name': dataElement['name'], 'visTypes': visTypes};
      if(dataElement['startDate']) this.dataByType[dataType][dataElement['id']]['startDate'] = dataElement['startDate'];
    }
  }


  bucketBySymptoms(dataInfo, datapointVal, symptoms){
    let symptomsToday = this.globalFuns.getWhetherMigraine(symptoms) ? 1 : 0;

    if(datapointVal === null) datapointVal = '(Not Reported)';

    if(dataInfo.field === 'time'){  // make readable/bucket by hour started
      let time = this.dateFuns.getTime(datapointVal);
      let timeString = time.format('ha');
      time.add(1, 'hour');
      datapointVal = timeString + '--' + time.format('ha');
    }
    else if(dataInfo.field === 'time range'){ // convert to duration
      datapointVal = this.dateFuns.getDuration(datapointVal['start'], datapointVal['end']);
    }

    if(dataInfo.dataDict[datapointVal]) dataInfo.dataDict[datapointVal] += symptomsToday;
    else dataInfo.dataDict[datapointVal] = symptomsToday;
    
  }

  addDatapoint(dataPoint : {[dataType: string] : any}){
    // wrangle into necessary data format for the vis lib
    let allDataTypes = Object.keys(this.dataByType);
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      let dataElementsTracking = this.currentGoals['dataToTrack'][dataType];
      for(let j=0; j<dataElementsTracking.length; j++){
        if (dataElementsTracking[j].field === 'note') continue;
        let dataElement = dataElementsTracking[j].id;
        let val = (dataPoint[dataType] && dataPoint[dataType][dataElement]) ?
                      dataPoint[dataType][dataElement] : null; // need nulls so lengths are the same for lib
        if(this.dataByType[dataType][dataElement].visTypes.indexOf('correlation')>-1){
          this.bucketBySymptoms(this.dataByType[dataType][dataElement], val, dataPoint['Symptom'])
        }
        else if(this.dataByType[dataType][dataElement].visTypes.indexOf('overTime')>-1){
          this.dataByType[dataType][dataElement]['data'].push(val); // make sure this is the best format!!
        }
      }
    }
  }


  makeAllCharts(){
    if(this.overTimeCharts['goals'].length > 0 && this.overTimeCharts['dataTypes'].length > 0){
      this.makeChartsOfType('overTime');
    }
    if(this.beforeAfterCharts['goals'].length > 0 && this.beforeAfterCharts['dataTypes'].length > 0){
      this.makeChartsOfType('beforeAfter');
    }
    if(this.correlationCharts['goals'].length > 0 && this.correlationCharts['dataTypes'].length > 0){
      this.makeChartsOfType('correlation');
    }
  }

  makeChartsOfType(chartType){
    let dataTypesToGraph = [];
    let chartFunction;
    let actualThis = this;
    if(chartType === 'correlation'){ // todo for overtime, before/after
      dataTypesToGraph = this.correlationCharts['dataTypes'];
      chartFunction = function(dataElement){
        actualThis.makeCorrelationChart(dataElement);
      }
    }
    if(chartType === 'beforeAfter'){
      dataTypesToGraph = this.beforeAfterCharts['dataTypes'];
      chartFunction = function(dataElement){
        actualThis.makeBeforeAfterChart(dataElement);
      }
    }
    for(let i=0; i<dataTypesToGraph.length; i++){
      let dataType = dataTypesToGraph[i];
      let dataElements = Object.keys(this.dataByType[dataType]);
      for (let i=0; i<dataElements.length; i++){
        let dataElement = this.dataByType[dataType][dataElements[i]];
        chartFunction(dataElement);
      }
    }
  }



  sortLabels(labels, field){
    let actualThis = this;
    labels.sort(function (key1, key2) {
      if (key1 === '(Not Reported)') {
        return 1;
      }
      if (key2 === '(Not Reported)') {
        return -1;
      }

      if(field==='time'){
        let time1Time = key1.split("--")[0],
            time2Time = key2.split("--")[0];
        return actualThis.dateFuns.compareTimes(time1Time, time2Time) ? 1 : -1;
      }
      else if (field === 'time range' || field === 'number' || field === 'numeric scale'){
        return Number(key1) > Number(key2) ? 1 : -1;
      }

      else if(field === 'binary'){
        return key1 === 'Yes' ? 1 : -1;
      }

      else if(field === 'category scale'){
        if(key1 === 'None' || key2 === 'Lots') return -1;
        if(key1 === 'Lots' || key1 === 'None') return 1;
        return 1;
      }

      else{
        console.log("field weird: " + field);
        return 1;
      }

    });

    if(field === 'time range'){
      labels = labels.map(function(x){
        if (x === '(Not Reported)') return x;
        else return actualThis.dateFuns.milisecondsToTime(Number(x));
      });
    }

    return labels
  }


  makeCorrelationChart(dataElement) {
    let field = dataElement['field'];
    let name = dataElement['name'];
    let type;

    if(field === 'category scale' || field === 'binary' || field === 'numeric scale' || field === 'time'){
      type = 'bar';
    }
    else if(field === 'number'){
      type = 'scatter';
    }
    else if (field === 'time range'){
      type = 'line';
    }
    else{
      console.log('weird field: ' + field);
      return;
    }

    let labels = this.sortLabels(Object.keys(dataElement.dataDict), field),
        data = [];


    for (let j = 0; j < labels.length; j++) {
      if (type === 'bar') {
        data.push(dataElement.dataDict[labels[j]]);
      }
      else if (type === 'scatter' || type === 'line') {
        if (labels[j] !== 'null') {
          data.push({'x': Number(labels[j]), 'y': dataElement.dataDict[labels[j]]});
        }
      }
    }

    this.correlationCharts.charts.push({
        'title': "Number of Migraines vs " + name,
        'labels': (type !== 'scatter') ? labels : null,
        'data': [{'data': data, 'showLine': false}],
        'options': this.chartOptions,
        'legend': false,
        'type': type
      });

  }


  makeBeforeAfterChart(change){
    let cutoffDate = moment(change['startDate']),
        today = moment();
    let prettyDate = this.dateFuns.dateToPrettyDate(cutoffDate);
    let daysInCutoffMonth = cutoffDate.daysInMonth(),
        daysInThisMonth = today.daysInMonth();
    let symptomsBefore = 0,
        symptomsAfter = 0;
    let monthsBeforeCutoff = cutoffDate.diff(this.dates[0], 'month', true),
        monthsAfterCutoff = today.diff(cutoffDate, 'month', true);

    for(let j=0; j<this.dates.length; j++){
      let symptoms = this.symptomBinaryByDate[j] ? 0 : 1;
      if(cutoffDate.isBefore(this.dates[j], 'month')
          && today.isAfter(this.dates[j], 'month')){
        symptomsAfter += symptoms;
      }
      else if(cutoffDate.isBefore(this.dates[j], 'month')){ // this month, so project
        symptomsAfter += symptoms / today.date() * daysInThisMonth;
      }
      else if(cutoffDate.isAfter(this.dates[j], 'month')){
        symptomsBefore += symptoms;
      }
      else { // same month, so project
        if(cutoffDate.isAfter(this.dates[j], 'day')){
          symptomsBefore += symptoms / cutoffDate.date() * daysInCutoffMonth;
        }
        else{
          symptomsAfter += symptoms / (daysInCutoffMonth - cutoffDate.date() ) * daysInCutoffMonth;
        }
      }
    }

    let data = [symptomsBefore / monthsBeforeCutoff, symptomsAfter  / monthsAfterCutoff];


    this.beforeAfterCharts.charts.push(
      {'title': 'Average Migraines per Month: ' + change.name,
        'labels': ['Before ' + prettyDate, 'After ' + prettyDate],
        'data': [{'data': data}],
        'options': this.chartOptions,
        'legend': false,
        'type': 'bar'
      });
  }




















  makeOverTimeChart(data, prettyDates:_date[], title:string){
    this.overTimeCharts.charts.push(
      {'title': title,
        'labels': prettyDates,
        'data': [{'data': data, 'showLine': false}],
        'options': this.timeOptions,
        'legend': false,
        'type': 'line',
      });
  }

  makeDayOfWeekChart(accumulatedData:{}, title:string){
    let labels = Object.keys(accumulatedData),
         data = [];

    var sorter = {
      "Mon": 1,
      "Tue": 2,
      "Wed": 3,
      "Thu": 4,
      "Fri": 5,
      "Sat": 6,
      "Sun": 7
    };

    labels.sort(function(d1, d2){
      return sorter[d1] > sorter[d2] ? 1 : -1;
    });

    for(let j=0; j<labels.length; j++){
      data.push(accumulatedData[labels[j]]);
    }

    this.overTimeCharts.charts.push(
      {'title': title,
        'labels': labels,
        'data': [{'data': data}],
        'options': this.chartOptions,
        'legend': false,
        'type': 'bar'
      });
  }



  getWhetherTreatmentTaken(treatmentDatapoint, field){ // assumes 'no' when not tracked
    if(field==='binary') return treatmentDatapoint === 'Yes';
    if(field==='number') return Number(treatmentDatapoint) > 0; // means we just indicate WHETHER they exercised :-/
    if(field==='numeric scale') return Number(treatmentDatapoint) > 0;
    if(field==='category scale') return treatmentDatapoint !== 'None';
    if(field==='time' || field==='time range') return treatmentDatapoint !== null;
  }


  accumulateDataByTreatment(dataType: {[dataProp: string] : any}, treatmentData : number[]){
    let dataDict = {};

    for(let i=0; i<dataType['data'].length; i++){
      let dataVal = dataType['data'][i];
      if(dataVal in dataDict){
        dataDict[dataVal] += treatmentData[i];
      }
      else{
        dataDict[dataVal] = treatmentData[i];
      }
    }
    return dataDict;
  }



  // makeChartsOverTime(){
  //
  //   let prettyDates = [];
  //   let daysOfWeek = [];
  //
  //   // they ignore points for which they don't have labels.  So not having an 8 means it's just skipped
  //   for(let i=0; i<this.dates.length; i++){
  //     prettyDates.push(this.dateFuns.dateToPrettyDate(this.dates[i]));
  //     daysOfWeek.push(this.dateFuns.getDayOfWeek(this.dates[i]));
  //   }
  //   let accumulatedData = this.accumulateDataBySymptoms({'data': daysOfWeek});
  //   this.makeOverTimeChart(this.symptomBinaryByDate, prettyDates, 'Migraines Over Time');
  //   this.makeDayOfWeekChart(accumulatedData, 'Number of Migraines vs Day of Week');
  //
  //   let allTrackedTreatments = Object.keys(this.treatments);
  //   let actualThis = this;
  //   for(let i=0; i<allTrackedTreatments.length; i++){
  //     let treatmentField = this.treatments[allTrackedTreatments[i]].field;
  //     let treatmentTakenPerDay = this.treatments[allTrackedTreatments[i]].data.map(function(datapoint){
  //       return (actualThis.getWhetherTreatmentTaken(datapoint, treatmentField) ? 1 : 0)
  //     });
  //
  //
  //     this.makeOverTimeChart(treatmentTakenPerDay, prettyDates,
  //                                     this.treatments[allTrackedTreatments[i]].name + ' Over Time');
  //     let accumulatedData = this.accumulateDataByTreatment({'data': daysOfWeek}, treatmentTakenPerDay);
  //     this.makeDayOfWeekChart(accumulatedData,this.treatments[allTrackedTreatments[i]].name + ' vs Day of Week');
  //   }
  //
  // }














  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

}
