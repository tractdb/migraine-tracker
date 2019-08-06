import {Component} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import * as moment from "moment";
import _date = moment.unitOfTime._date;
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {GoalDetailsServiceProvider} from "../../providers/goal-details-service/goal-details-service";

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

  allTrackedData : {[trackedData:string]: any;}[] = [];
  currentGoals : {[goalAspect:string]: any} = {};

  dates : _date[] = [];
  symptoms : boolean[] = [];
  contributors : {[contributorID:string]: any}  = {};
  treatments : {[treatmentID:string]: any} = {};
  changes : {[treatmentID:string]: any} = {};



  correlationCharts : {[chartTypeProps: string ] : any} = {'title': 'Trends in Contributors', 'charts': [],
                                                              'goals': []};
  beforeAfterCharts : {[chartTypeProps: string ] : any}= {'title': 'Trends Since Making a Change', 'charts': [],
                                                            'goals': []};
  overTimeCharts : {[chartTypeProps: string ] : any} = {'title': 'Trends Over Time', 'charts': [],
                                                            'goals': []};


  allCurrentCharts : {[chartTypeProps: string ] : any}[] = [this.beforeAfterCharts,
                                                                this.overTimeCharts, this.correlationCharts];

  chartOptions : {[chartProps: string ] : any} = {
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
          distribution: 'linear'
        }
      }]
    }
  };


  timeOptions = this.makeTimeOptions();



  chartColors : {[chartColorType: string] : string}[] = [{ // library needs it to be a list
    backgroundColor: '#547688',
    borderColor: '#547688',
    pointBackgroundColor: '#547688',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#547688'
  }];


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public goalDetailsService: GoalDetailsServiceProvider,
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



  makeChartsOverTime(){

    let prettyDates = [];
    let daysOfWeek = [];

    // they ignore points for which they don't have labels.  So not having an 8 means it's just skipped
    for(let i=0; i<this.dates.length; i++){
      prettyDates.push(this.dateFuns.dateToPrettyDate(this.dates[i]));
      daysOfWeek.push(this.dateFuns.getDayOfWeek(this.dates[i]));
    }
    let accumulatedData = this.accumulateDataBySymptoms({'data': daysOfWeek});
    this.makeOverTimeChart(this.symptoms, prettyDates, 'Migraines Over Time');
    this.makeDayOfWeekChart(accumulatedData, 'Number of Migraines vs Day of Week');

    let allTrackedTreatments = Object.keys(this.treatments);
    let actualThis = this;
    for(let i=0; i<allTrackedTreatments.length; i++){
      let treatmentField = this.treatments[allTrackedTreatments[i]].field;
      let treatmentTakenPerDay = this.treatments[allTrackedTreatments[i]].data.map(function(datapoint){
        return (actualThis.getWhetherTreatmentTaken(datapoint, treatmentField) ? 1 : 0)
      });


      this.makeOverTimeChart(treatmentTakenPerDay, prettyDates,
                                      this.treatments[allTrackedTreatments[i]].name + ' Over Time');
      let accumulatedData = this.accumulateDataByTreatment({'data': daysOfWeek}, treatmentTakenPerDay);
      this.makeDayOfWeekChart(accumulatedData,this.treatments[allTrackedTreatments[i]].name + ' vs Day of Week');
    }

  }

  makeBeforeAfterCharts(){
    let allChanges = Object.keys(this.changes);

    for(let i=0; i<allChanges.length; i++){
      let change = this.changes[allChanges[i]];
      let cutoffDate = moment(change['startDate']);
      let prettyDate = this.dateFuns.dateToPrettyDate(cutoffDate);
      let daysInMonth = cutoffDate.daysInMonth();
      let symptomsBefore = 0,
          symptomsAfter = 0,
          monthsBefore = new Set(),
          monthsAfter = new Set();

      for(let j=0; j<this.dates.length; j++){
        let monthOfReport = moment(this.dates[j]);
        let symptoms = this.symptoms[j] ? 0 : 1;
        if(cutoffDate.isBefore(this.dates[j], 'month')){
          symptomsBefore += symptoms;
          monthsBefore.add(monthOfReport.format("MMM YYYY"));
        }
        else if(cutoffDate.isAfter(this.dates[j], 'month')){
          symptomsAfter += symptoms;
          monthsAfter.add(monthOfReport.format("MMM YYYY"));
        }
        else { // same month, so project
          if(cutoffDate.isAfter(this.dates[j], 'day')){
            symptomsAfter += symptoms / (daysInMonth - cutoffDate.date() ) * daysInMonth;
            monthsAfter.add(monthOfReport.format("MMM YYYY"));
          }
          else{
            symptomsBefore += symptoms / cutoffDate.date() * daysInMonth;
            monthsBefore.add(monthOfReport.format("MMM YYYY"));
          }
        }
      }


      let data = [symptomsBefore / monthsBefore.size, symptomsAfter / monthsAfter.size ];


      this.beforeAfterCharts.charts.push(
        {'title': 'Average Migraines per Month Before and After Change: ' + change.name,
          'labels': ['Before ' + prettyDate, 'After ' + prettyDate],
          'data': [{'data': data}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'bar'
        });

    }

  }


  accumulateDataBySymptoms(dataType : {[dataProps:string]:any}) : {}{
    let dataDict = {};

    for(let i=0; i<dataType['data'].length; i++){
      let dataVal = dataType['data'][i];
      if(dataDict['dataVal']){
        dataDict[dataVal] += (this.symptoms ? 1 : 0);
      }
      else{
        dataDict[dataVal] = (this.symptoms ? 1 : 0);
      }
    }
    return dataDict;
  }


  makeCorrelationChart(dataType){
    let field = dataType['field'];
    let name = dataType['name'];
    let dateFuns = this.dateFuns;

    if(field === 'category scale' || field === 'binary' || field === 'numeric scale'){
      let accumulatedData = this.accumulateDataBySymptoms(dataType);
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
        {'title': "Number of Migraines vs " + name,
          'labels': labels,
          'data': [{'data': data}],
          'options': this.chartOptions,
          'legend': false,
          'type': 'bar'
        });

    }
    else if(field === 'number'){

      let accumulatedData = this.accumulateDataBySymptoms(dataType);
      let labels = Object.keys(accumulatedData),
          data = [];
      for(let j=0; j<labels.length; j++){
        if(labels[j] !== 'null'){
          data.push({'x': Number(labels[j]), 'y': accumulatedData[labels[j]]})
        }
      }

      this.correlationCharts.charts.push(
        {'title': "Number of Migraines vs " + name,
          'data': [{'data': data}],
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

      let accumulatedData = this.accumulateDataBySymptoms(dataType);
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
        {'title': "Number of Migraines vs " + name,
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

      let accumulatedData = this.accumulateDataBySymptoms(dataType);
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

      this.correlationCharts.charts.push(
        {'title': "Number of Migraines vs " + name,
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

  makeCorrelationCharts(){
    let dataTypes = Object.keys(this.contributors);
    for (let i=0; i<dataTypes.length; i++){
      this.makeCorrelationChart(this.contributors[dataTypes[i]])
    }
  }


  makeAllCharts(){
    if(this.overTimeCharts['goals'].length > 0){
      this.makeChartsOverTime();
    }
    if(this.beforeAfterCharts['goals'].length > 0){
      this.makeBeforeAfterCharts();
    }
    if(this.correlationCharts['goals'].length > 0){
      this.makeCorrelationCharts();
    }
  }



  addDatapointToDict(dataPoint : {[dataItem: string] : any}, dataDict : {[dataItemProps: string] : any}){
    let allDataTypes = Object.keys(dataDict);
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      if(dataPoint[dataType]){
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
      dataDict[dataInfo['id']] = {'data': [], 'field': currentlyTracking[i]['field'], 'name': dataInfo['name']};
      if(currentlyTracking[i]['startDate']) dataDict[dataInfo['id']]['startDate'] = currentlyTracking[i]['startDate'];
    }
  }



  organizeData(){ // because the chart library apparently can't deal with json-format data, make everything into lists
    this.initializeDict(this.treatments, this.currentGoals['dataToTrack']['Treatments']);
    this.initializeDict(this.contributors, this.currentGoals['dataToTrack']['Contributors']);
    this.initializeDict(this.changes, this.currentGoals['dataToTrack']['Changes']);
    for(let i=0; i<this.allTrackedData.length; i++){
      let datapoint = this.allTrackedData[i];
      this.dates.push(datapoint['startTime']);
      this.symptoms.push(this.globalFuns.getWhetherMigraine(datapoint['Symptom']));
      this.addDatapointToDict(datapoint['Treatments'], this.treatments);
      this.addDatapointToDict(datapoint['Contributors'], this.contributors);
      this.addDatapointToDict(datapoint['Changes'], this.changes);
    }
    this.makeAllCharts();
  }


  setVisTypes(){
    let goals = this.currentGoals['goals'];
    for(let i=0; i<goals.length; i++){
      let goal = goals[i];
      let visType = this.goalDetailsService.getGoalByID(goal)['visType'];
      if(visType === 'overTime'){
        this.overTimeCharts['goals'].push(goal);
      }
      else if(visType === 'beforeAfter'){
        this.beforeAfterCharts['goals'].push(goal);
      }
      else if(visType === 'correlation'){
        this.correlationCharts['goals'].push(goal);
      }
      else{
        console.log("Vis not supported: " + visType);
      }
    }
    this.organizeData();
  }


  sortByDate(allData : {[trackedData:string]: any;}[]) : {[trackedData:string]: any;}[]{
    allData.sort(function(d1, d2){
      return new Date(d1.startTime) > new Date(d2.startTime) ? 1: -1;
    });
    return allData;
  }


  ionViewDidLoad() {
    this.allTrackedData = this.sortByDate(this.couchDBService.getTrackedData());
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
