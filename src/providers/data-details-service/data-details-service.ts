import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class DataDetailsServiceProvider {

  private supportedFields : any;
  private listedData : {[dataType: string] : any};
  private configData : any;
  private medTrackingIDs : string[] = ['asNeededMeds', 'newAsNeededMedication'];

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

  getWhetherGoals(dataType: string) : boolean{
    return this.getConfigByName(dataType)['dataGoals'];
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


  getMedTrackingIDs() : string[] {
    return this.medTrackingIDs;
  }


  getWhetherTrackingMeds(treatmentsTracking: string[]) : boolean{
    if(!treatmentsTracking) return false;
    for(let i=0; i<this.medTrackingIDs.length; i++){
      if(treatmentsTracking.indexOf(this.medTrackingIDs[i]) > -1){
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

  getDataIDs(dataToTrack : {[dataType: string] : any}[]) : string[] {
    if(!dataToTrack) return [];
    let dataIDs = [];
    for(let i=0; i<dataToTrack.length; i++){
      dataIDs.push(dataToTrack[i].id);
    }
    return dataIDs;
  }

  getDataFromID(dataToTrack: {[dataType: string] : any}[], id : string) : {[dataAttrs: string] : any}{
    if(!dataToTrack) return [];
    for(let i=0; i<dataToTrack.length; i++){
      if(dataToTrack[i].id === id){
        return dataToTrack[i];
      }
    }
    return null;
  }




  getRecsAndCommon(alreadyTracking: {[dataType:string]:any}, dataType: string,
                   goalIDs: string[]) : any[]{
    let dataOfType = this.listedData[dataType];
    let otherData = [];
    let recData = [];
    let trackingMeds = this.getWhetherTrackingMeds(this.getDataIDs(alreadyTracking['Treatments']));

    for(let i=0; i<dataOfType.length; i++){
      let dataObject = dataOfType[i];
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
        let trackingData = this.getDataFromID(alreadyTracking[dataType], dataObject.id);
        if(recommended){
          if(trackingData) recData.push(trackingData);
          else recData.push(dataObject);
        }
        else{
          if(trackingData) otherData.push(trackingData);
          else otherData.push(dataObject);
        }
      }
    }

    return [recData, otherData];


  }

}
