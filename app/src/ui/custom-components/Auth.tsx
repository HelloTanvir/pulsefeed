import { FC, FormEvent, useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { LoginDto, SignUpDto } from "@/lib/dto/auth.dto";
import { AuthService } from "@/lib/services/auth.service";

interface Props {
  defaultScreen?: "login" | "signup";
}

interface FormState {
  login: LoginDto;
  signup: SignUpDto;
}

const Auth: FC<Props> = ({ defaultScreen = "login" }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState<FormState>({
    login: {
      email: "",
      password: "",
      remember: false,
    },
    signup: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setIsLogin(defaultScreen === "login");
  }, [defaultScreen]);

  const handleInputChange = (key: string, value: string) => {
    if (isLogin) {
      setState((prev) => ({ ...prev, login: { ...prev.login, [key]: value } }));
    } else {
      setState((prev) => ({
        ...prev,
        signup: { ...prev.signup, [key]: value },
      }));
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let success = false;

    const authService = new AuthService();
    if (isLogin) {
      const res = await authService.login(state.login);
      success = res.success;
    } else {
      const res = await authService.signup(state.signup);
      success = res.success;
    }

    if (success) {
      window?.location?.replace('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-10 mb-8">
        <h1
          className="text-3xl font-bold text-blue-400"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          PulseFeed
        </h1>
        <p
          className="text-xs text-gray-400 mt-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Stay Updated, Stay in the Loop
        </p>
      </div>

      {/* Auth Container */}
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-8">
          {/* Tab Switching */}
          <div className="flex mb-8 border-b border-gray-700">
            <button
              className={`flex-1 pb-4 text-center ${
                isLogin
                  ? "border-b-2 border-blue-400 text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 pb-4 text-center ${
                !isLogin
                  ? "border-b-2 border-blue-400 text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    className="w-full bg-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full bg-gray-700 rounded-lg py-3 px-4 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full bg-gray-700 rounded-lg py-3 px-4 pl-11 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300" htmlFor="password">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="w-full bg-gray-700 rounded-lg py-3 px-4 pl-11 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                  />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <label className="text-sm text-gray-400 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="remember"
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        login: { ...prev.login, remember: e.target.checked },
                      }))
                    }
                  />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
            >
              <span>{isLogin ? "Login" : "Create Account"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* OAuth Options */}
            <div className="relative mt-8 pt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg py-3 px-4 transition-colors">
                <img
                  src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-lg py-3 px-4 transition-colors">
                <img
                  src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                <span>Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Switch between Login/Signup */}
        <p className="text-center mt-8 text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
