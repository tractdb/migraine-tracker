import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// import { Chart } from 'chart.js';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import * as moment from "moment";
import _date = moment.unitOfTime._date;

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

  correlationCharts = [];
  lineCharts = {};


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider,
              public globalFuns: GlobalFunctionsServiceProvider) {
  }




  makeChartsOverTime(){


  }

  makeBeforeAfterCharts(){

  }


  makeCorrelationChart(dataType, name){
    let field = dataType['field'];
    if(field === 'category scale' || field === 'binary' || field === 'numeric scale'){

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

      let labels = Object.keys(dataDict);
      let data = [];
      for(let j=0; j<labels.length; j++){
        data.push(dataDict[labels[j]]);
      }

      console.log(labels);
      console.log(labels.indexOf("null"))

      var nullIndex = labels.indexOf("null");
      if (nullIndex !== -1) {
        labels[nullIndex] = '(Not Reported)';
      }

      this.correlationCharts.push(
        {'title': name,
          'labels': labels,
          'data': data,
          'options': {
            scaleShowVerticalLines: false,
            responsive: true,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero:true,
                  stepSize: 1,
                  // max : 100
                }
              }],
              xAxes: [{
                ticks: {
                  beginAtZero:true,
                  autoSkip: false
                }
              }]
            }
          },
          'legend': false,
          'type': 'bar'
        });
      console.log(this.barCharts);
    }

    else if(field === 'number'){

    }



    else if(field === 'time'){

    }

    else if(field === 'time range'){

    }

    else if(field === 'number'){
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
      console.log(datapoint);
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
