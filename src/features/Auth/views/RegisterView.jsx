export default function RegisterView({
  formData,
  onChange,
  loading,
  error,
  onSubmit
}) {
  return (
    <div className="register-container">
      <form onSubmit={onSubmit}>
        <h2>Registrarse</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={onChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="passwordConfirm"
          placeholder="Confirmar Contraseña"
          value={formData.passwordConfirm}
          onChange={onChange}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={onChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}
