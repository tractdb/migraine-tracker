import { Injectable } from '@angular/core';

/*
  Generated class for the GlobalFunctionsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalFunctionsServiceProvider {

  private changeSubgoal = "Learn whether a specific change affects my migraines";

  constructor() {
  }

  getAllGoalsAndSubgoals(configPath) {
    let goals = [];
    for (let i = 0; i < configPath.length; i++) {
      console.log(configPath[i]);
      if(configPath[i].step.includes("goal")){
        console.log("here")
        goals = goals.concat(configPath[i].added);
      }
    }
    return goals;
  }

  findNextConfigData(configPath, configDataList) {
    let totalDataTypes = configDataList.length;
    for(let i = 0; i < totalDataTypes; i++) {
      let dataType = configDataList.splice(0, 1)[0];
      if(!(dataType.conditionalGoal)){
        return {"dataType": dataType, "configList": configDataList};
      }
      else{
        for (let i = 0; i < configPath.length; i++) {
          if (configPath[i].added.includes(dataType.conditionalGoal)) {
            return {"dataType": dataType, "configList": configDataList};
          }
        }
      }
    }
    return null;
  }


  buttonColors(added){
    if(added){
      return {"add": "secondary", "remove": "light"};
    }
    else{
      return {"add": "light", "remove": "danger"};
    }
  }

  getChangeSubgoal(){
    return this.changeSubgoal;
  }


  toggleDetails(configStep) {
    if (configStep.showDetails || configStep.showDetails == undefined) {
      configStep.showDetails = false;
      configStep.icon = 'ios-add-circle-outline';
    }
    else {
      configStep.showDetails = true;
      configStep.icon = 'ios-remove-circle-outline';
    }
    return configStep;
  }

}
