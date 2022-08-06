import { Component } from '@angular/core';
import { map, of } from 'rxjs';
import { LoginWebService } 
  from '../../../projecte/_model/01-serviceLayer/api/loginWebService';
import { ServiceManager } from '../../../projecte/_model/01-serviceLayer/managers/serviceManager';
import { Login } from '../../../projecte/_model/02-entitiesLayer/entities/login/Login';
import { LoginDAO } from '../../../projecte/_model/03-persistenceLayer/impl/webStorage/daos/login/LoginDAO';


@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hide = true;                
  usuari?:string; 
  password?:string;  
  jwtToken?:string;

  constructor(private loginWebService: LoginWebService,private serviceManager: ServiceManager) {}

  autentificar() {
    var login:Login = Login.inicialitzar(this.usuari!,this.password!);
    
    this.loginWebService.autentificar(login).subscribe(token => {
       var tokenAux:any = token;
       if (tokenAux==null) console.log("Autentificació no vàlida");
       else this.jwtToken=tokenAux['response'][0];
       LoginDAO.save(this.jwtToken!);
       console.log(this.jwtToken);
    });
  }

  prorrogarToken(token: any):boolean {
    const keysObj:number = Object.keys(token).length;
    const renovar:number = JSON.parse(token['response'][0]).new.length;
    return Object.keys(token).length!==0 && JSON.parse(token['response'][0]).new.length!==0;
  }

  verificarToken() {
    this.loginWebService.verificarToken().subscribe(  
      {
        next: (v) => {
          if (this.prorrogarToken(v)) { 
            console.log(v['response'][0]),
            LoginDAO.save(JSON.stringify(JSON.parse(v['response'][0]).new));
          }
        },
        error: (e) => console.error("Error en l'execució"),        
      }            
    );
  }
}

