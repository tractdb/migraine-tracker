import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class DataDetailsServiceProvider {

  private supportedFields : any;
  private listedData : {[dataType: string] : any};
  private configData : any;

  constructor(public http: HttpClient) {
    this.openListedData();
    this.openDataConfig();
    this.openSupportedFields();
  }

  openDataConfig() {
    this.http.get('assets/dataConfig.json', {},).subscribe(configData => {
        this.configData = configData;
      },
      error => {
        console.log(error);
      });
  }

  openSupportedFields() {
    this.http.get('assets/supportedFields.json', {},).subscribe(fieldList => {
        this.supportedFields = fieldList;
      },
      error => {
        console.log(error);
      });
  }

  openListedData() {
    this.http.get('assets/listedData.json', {},).subscribe(listedData => {
        this.listedData = listedData;
      },
      error => {
        console.log(error);
      });
  }


  getConfigByName(dataType: string) : {[dataTypeProps:string]:any}{
    for(let i=0; i<this.configData.length; i++){
      if(this.configData[i]['dataType'] === dataType){
        return this.configData[i];
      }
    }
    console.log("DATATYPE NOT IN DATA CONFIG: " + dataType);
    return null;
  }

  getAllDataTypes() : string[]{
    let allDataTypes = [];
    for(let i=0; i<this.configData.length; i++){
      allDataTypes.push(this.configData[i].dataType);
    }
    return allDataTypes;
  }

  getDataList(goals) : any[]{
    let dataList = [];
    for(let i=0; i<this.configData.length; i++){
      let condGoal = this.configData[i].conditionalGoal;
      if(condGoal){
        if(goals.indexOf(condGoal) > -1){
          dataList.push(this.configData[i].dataType);
        }
      }
      else{
        dataList.push(this.configData[i].dataType);
      }
    }
    return dataList;
  }

  getSupportedFields() : [{[fieldProp : string]:any}] {
    return this.supportedFields;
  }


  getWhetherTrackingMeds(treatmentsTracking: {[dataAttr: string] : any}[]) : boolean{
    if(!treatmentsTracking) return false;
    for(let i=0; i<treatmentsTracking.length; i++){
      if(treatmentsTracking[i].isMed){
        return true;
      }
    }
    return false;
  }

  getDisplayName(dataType : string) : string{
    for(let i=0; i<this.configData.length; i++){
      if(this.configData[i].dataType === dataType){
        if(this.configData[i].toDisplay){
          return this.configData[i].toDisplay;
        }
        else{
          return dataType;
        }
      }
    }
  }


  getWhetherRecommended(activeGoals: string[], recs: string[]){
    // based on the set of configured goals, returns whether we recommend a specific data element
    for(let i=0; i<activeGoals.length; i++){
      if(recs.indexOf(activeGoals[i]) > -1){
        return true;
      }
    }
    return false;
  }


  findNextConfigData(goalIDs, currentlyConfiguring) {
    let newDataIndex = this.configData.indexOf(currentlyConfiguring) + 1;
    for(let i = newDataIndex; i < this.configData.length; i++) {
      let dataType = this.configData[i];
      if(!(dataType.conditionalGoals)){
        return dataType;
      }
      else{
        for(let j=0; j<dataType.conditionalGoals.length; j++){ // if it has ANY of the conditional goals, show the page
          if(goalIDs.indexOf(dataType.conditionalGoals[j]) > -1){
            return dataType;
          }
        }
      }
    }
    return null;
  }


  getWhetherIsMed(dataType: string, id: string) : {[dataAttrs: string] : any}{
    // uses the listed data to find the original data type
    for(let i=0; i<this.listedData[dataType].length; i++) {
      if (this.listedData[dataType][i].id === id) {
        return this.listedData[dataType][i].isMed;
      }
      return null;
    }
  }



  findDataByID(dataToTrack: {[dataType: string] : any}[], id : string) : {[dataAttrs: string] : any}{
    // finds the data object in the list given the ID
    if(!dataToTrack) return null;
    for(let i=0; i<dataToTrack.length; i++){
      if(dataToTrack[i].id === id){
        return dataToTrack[i];
      }
    }
    return null;
  }




  getDataLists(alreadyTracking: {[dataType:string]:any}, dataType: string,
               goalIDs: string[]) : {[listInfo: string] : any}{
    let dataOfType = this.listedData[dataType];
    let otherData = [];
    let recData = [];
    let alwaysQuickTrack = [];
    let trackingMeds = this.getWhetherTrackingMeds(alreadyTracking['Treatment']);
    let expandOther = false;

    for(let i=0; i<dataOfType.length; i++){
      let dataObject = dataOfType[i];
      if (dataObject['alwaysQuickTrack']){
        dataObject['dataType'] = dataType;
        alwaysQuickTrack.push(dataObject);
      }
      let skip = false;
      let recommended = this.getWhetherRecommended(goalIDs, dataObject['recommendingGoals']);
      if(dataObject['condition']) {
        if(dataObject['id'] === 'frequentMedUse' || dataObject['id'] === 'whetherMedsWorked'){
          if(!trackingMeds){
            skip = true;
          }
        }
        else if(dataObject['skipIfGoals']){
          for(let j=0; j<dataObject['skipIfGoals'].length; j++){
            if(goalIDs.indexOf(dataObject['skipIfGoals'][j])>-1){
              skip = true;
              break;
            }
          }
        }
        else{
          console.log("CONDITION BUT NO FUNCTION!");
        }
      }
      if(!skip){
        let trackingData = this.findDataByID(alreadyTracking[dataType], dataObject.id);
        if(recommended){
          if(trackingData) recData.push(trackingData);
          else recData.push(dataObject);
        }
        else{
          if(trackingData){
            otherData.push(trackingData);
            expandOther = true;
          }
          else otherData.push(dataObject);
        }
      }
    }

    return {'recData': recData, 'otherData':otherData, 'expandOther': expandOther, 'alwaysTrack': alwaysQuickTrack};


  }

}
