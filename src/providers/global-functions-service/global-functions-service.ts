import { Injectable } from '@angular/core';

/*
  Generated class for the GlobalFunctionsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalFunctionsServiceProvider {

  constructor() {
  }

  buttonColors(added){
    if(added){
      return {"add": "secondary", "remove": "light"};
    }
    else{
      return {"add": "light", "remove": "danger"};
    }
  }

}
