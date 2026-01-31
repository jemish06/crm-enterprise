import { RegisterForm } from '../components/RegisterForm'
import { Briefcase } from 'lucide-react'

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Briefcase className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">CRM Enterprise</h1>
          <p className="mt-2 text-muted-foreground">
            Start managing your business better today
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
