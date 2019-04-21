import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";

/**
 * Generated class for the ViewDatapointPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-datapoint',
  templateUrl: 'view-datapoint.html',
})
export class ViewDatapointPage {
  dataTypes: string[] = [];
  dataDict : {[datapointProps: string] : any} = {};
  displayNames : {[shortName : string] : string}= {};
  today : any = new Date();
  edit: boolean = false;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams,
              public dataDetailsService:DataDetailsServiceProvider, public dateFunctions: DateFunctionServiceProvider,
              public couchDBService: CouchDbServiceProvider) {
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }


  changeVals(componentEvent : {[eventPossibilities: string] : any}, dataType : string,
             dataItem : {[dataProps: string] : any}){
    // todo: push to database!
    let itemIndex = this.dataDict[dataType]['dataArray'].indexOf(dataItem);
    console.log(this.dataDict[dataType]['dataArray'][itemIndex]);
    if(componentEvent.dataVal){
      this.dataDict[dataType][dataItem.data.id] = componentEvent.dataVal;
      this.dataDict[dataType]['dataArray'][itemIndex]['value'] = (dataItem.data.field === 'time' ?
        this.dateFunctions.timeTo12Hour(componentEvent.dataVal) : componentEvent.dataVal);
    }
    if(componentEvent.dataStart){
      this.dataDict[dataType][dataItem.data.id]['start'] = componentEvent.dataStart;
      this.dataDict[dataType]['dataArray'][itemIndex]['value']['start'] =
        this.dateFunctions.timeTo12Hour(componentEvent.dataStart);
    }
    if(componentEvent.dataEnd){
      this.dataDict[dataType][dataItem.data.id]['end'] = componentEvent.dataEnd;
      this.dataDict[dataType]['dataArray'][itemIndex]['value']['end'] =
        this.dateFunctions.timeTo12Hour(componentEvent.dataEnd);
    }

    if(this.dataDict['dateChanged'].indexOf(this.today) < 0){
      this.dataDict['dateChanged'].push(this.today);
    }
  }


  startEditing(){
    this.edit = true;
  }



  transformIntoArray(dataType : string, dataInRoutine : {[dataProp: string] : any}[]) : {[dataProp: string] : any}[]{
    //since ionic won't allow iteration on dicts.  Fun.
    let allData = [];
    let dataTypeDict = this.dataDict[dataType];
    let dataElements = Object.keys(dataTypeDict);
    this.dataDict[dataType]['dataArray'] = [];
    for(let i=0; i<dataInRoutine.length; i++){
      let dataInfo = dataInRoutine[i];
      if(dataInfo.field === 'calculated medication use') continue;
      let element = {'data' : dataInfo};
      let found = false;
      for(let j=0; j<dataElements.length; j++){
        if(dataInfo.id === dataElements[j] && dataTypeDict[dataElements[j]] != ''){
          if (dataInfo.field === 'time range') {
            element['value'] = {
              'start': this.dateFunctions.timeTo12Hour(dataTypeDict[dataElements[j]].start),
              'end': this.dateFunctions.timeTo12Hour(dataTypeDict[dataElements[j]].end)
            };
            element['isDuration'] = true;
          }
          else if (dataInfo.field === 'time') {
            element['value'] = this.dateFunctions.timeTo12Hour(dataTypeDict[dataElements[j]]);
          }
          else {
            element['value'] =  dataTypeDict[dataElements[j]];
          }
          allData.push(element);
          found=true;
          break;
        }
      }
      if(!found){
        allData.push(element);
      }
    }
    return allData;
  }

  ionViewDidLoad() {
    this.dataDict = this.navParams.data;
    console.log(this.dataDict);
    console.log(this.dateFunctions.dateToPrettyDate(this.dataDict['startTime'], true))
    if(!this.dataDict['dateChanged']){
      this.dataDict['dateChanged'] = [];
    }
    this.dataDict['date'] = this.dateFunctions.dateToPrettyDate(this.dataDict['startTime'], true);
    let configuredGoals = this.couchDBService.getActiveGoals();

    let allDataTypes = this.dataDetailsService.getAllDataTypes();
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      if(configuredGoals['dataToTrack'][dataType]){
        if(!this.dataDict[dataType]) this.dataDict[dataType] = {};
        this.dataDict[dataType]['dataArray'] = this.transformIntoArray(dataType,
                                                                          configuredGoals['dataToTrack'][dataType]);
        if(this.dataDict[dataType]['dataArray'].length > 0){
          this.displayNames[dataType] = this.dataDetailsService.getDisplayName(dataType);
          this.dataTypes.push(dataType);
        }
      }
    }
  }

}
