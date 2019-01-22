import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the DataDetailsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataDetailsServiceProvider {

  private recommendationData;
  private supportedFields;

  constructor(public http: HttpClient) {
    console.log('Hello DataDetailsServiceProvider Provider');
    this.getDataRecommendations();
    this.getSupportedFields();
  }

  getSupportedFields() {
    this.http.get('assets/supportedFields.json', {},).subscribe(fieldList => {
        this.supportedFields = fieldList;
      },
      error => {
        console.log(error);
      });
  }

  getDataRecommendations() {
    this.http.get('assets/recommendationsByGoal.json', {},).subscribe(recommendationData => {
        this.recommendationData = recommendationData;
      },
      error => {
        console.log(error);
      });
  }

  getRecommendations(name, dataType) {
    let fullName = null;

    if(name in this.recommendationData){ // full name was used
      fullName = name;
    }

    else { //used only "learning", for ex
      Object.keys(this.recommendationData).forEach(function(goalName) {
        if(goalName.includes(name)){
          fullName = goalName;
        }
      });
    }

    console.log(this.recommendationData);
    console.log(name);

    if(fullName !== null){
      return this.recommendationData[fullName][dataType];
    }

    return null;
  }
}
