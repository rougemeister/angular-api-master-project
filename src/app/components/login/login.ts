import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth-service";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  error: string = '';
  form: any;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      const success = this.auth.login(username!, password!);

      if (success) {
        this.router.navigate(['/']);
      } else {
        this.error = 'Invalid username or password';
      }
    }
  }
}