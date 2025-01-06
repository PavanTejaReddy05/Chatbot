import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './sign-in/sign-in.component';
import { SignupComponent } from './signup/signup.component';
import { IndexComponent } from './index/index.component';

const routes: Routes = [
  {path:'signin', component:SigninComponent},
  {path:'signup', component:SignupComponent},
  {path:'index', component:IndexComponent},
  {path:'', redirectTo:'/signin', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
