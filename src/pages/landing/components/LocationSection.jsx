import { Clock, Mail, MapPin, Navigation, Phone, Utensils } from 'lucide-react';
import locationFonda from '../../../shared/assets/images/location-fonda.jpg';

const LOCATION_DETAILS = [
  {
    icon: MapPin,
    label: 'Dirección',
    value: 'Av. Primera Nte. Ote. 229, San Jacinto, 29150 Suchiapa, Chis.',
  },
  {
    icon: Clock,
    label: 'Horarios',
    value: 'Lun - Vie: 8:00 AM - 6:00 PM',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+52 (951) 123 4567',
  },
  {
    icon: Mail,
    label: 'Correo electrónico',
    value: 'contacto@fondapuravida.com',
  },
];

export function LocationSection() {
  return (
    <section
      className="landing-section landing-location"
      id="ubicacion"
      aria-labelledby="location-title"
    >
      <header className="landing-section__header">
        <h2 id="location-title">Ubicación</h2>
        <p>Visítanos y disfruta de comida casera preparada con ingredientes locales y mucho amor.</p>
      </header>

      <div className="landing-location__grid">
        <div
          className="landing-map"
          role="img"
          aria-label="Mapa de referencia de la ubicación de PuraVida"
        >
          <span className="landing-map__notice">
            <Navigation size={17} aria-hidden="true" />
            Mapa próximamente
          </span>
          <span className="landing-map__pin">
            <MapPin size={34} strokeWidth={2.4} aria-hidden="true" />
            <small>PuraVida</small>
          </span>
        </div>

        <article className="landing-location__details">
          <h3>Información de la fonda</h3>
          <div className="landing-location__list">
            {LOCATION_DETAILS.map((detail) => {
              const Icon = detail.icon;

              return (
                <div className="landing-location__item" key={detail.label}>
                  <span className="landing-location__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <strong>{detail.label}</strong>
                    <span>{detail.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <small className="landing-location__reference">
            Información estática de referencia mientras se habilita su administración.
          </small>
        </article>
      </div>

      <article className="landing-location__welcome">
        <span className="landing-location__welcome-icon" aria-hidden="true">
          <Utensils size={26} strokeWidth={2} />
        </span>
        <div>
          <h3>¡Te esperamos!</h3>
          <p>
            Ven con tu familia y amigos a disfrutar del auténtico sabor de casa. Consulta nuestro
            horario y visítanos cuando la fonda esté abierta.
          </p>
        </div>
        <img src={locationFonda} alt="Ilustración de la fachada de PuraVida" loading="lazy" />
      </article>
    </section>
  );
}
