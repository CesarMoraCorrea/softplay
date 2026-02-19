export default function LoginView({
  email,
  setEmail,
  password,
  setPassword,
  captcha,
  setCaptcha,
  loading,
  error,
  onSubmit
}) {
  return (
    <div className="login-container">
      <form onSubmit={onSubmit}>
        <h2>Iniciar Sesión</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CAPTCHA"
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
