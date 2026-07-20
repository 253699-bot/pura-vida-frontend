import { Clock, ExternalLink, Mail, MapPin, Phone, Utensils } from 'lucide-react';
import locationFonda from '../../../shared/assets/images/location-fonda.jpg';
import { useBusinessConfiguration } from '../../../shared/hooks/useBusinessConfiguration.js';

const FONDA_LATITUDE = 16.6235021;
const FONDA_LONGITUDE = -93.1000717;
const MAP_EMBED_URL = `https://www.google.com/maps?q=${FONDA_LATITUDE},${FONDA_LONGITUDE}&z=16&output=embed`;
const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${FONDA_LATITUDE},${FONDA_LONGITUDE}`;

function createLocationDetails(configuration) {
  return [
    {
      icon: MapPin,
      label: 'Dirección',
      value: configuration?.direccion || 'Av. Primera Nte. Ote. 229, San Jacinto, 29150 Suchiapa, Chis.',
    },
    {
      icon: Clock,
      label: 'Horarios',
      value: configuration?.horarios || 'Lun - Vie: 8:00 AM - 6:00 PM',
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: configuration?.telefono || '+52 (951) 123 4567',
    },
    {
      icon: Mail,
      label: 'Correo electrónico',
      value: configuration?.correo || 'contacto@fondapuravida.com',
    },
  ];
}

export function LocationSection({ businessName = 'PuraVida' }) {
  const { configuration } = useBusinessConfiguration();
  const details = createLocationDetails(configuration);

  return (
    <section
      className="landing-section landing-location"
      id="ubicacion"
      aria-labelledby="location-title"
    >
      <header className="landing-section__header">
        <h2 id="location-title">Ubicación</h2>
        <p>Visítanos y disfruta de comida casera preparada con ingredientes locales.</p>
      </header>

      <div className="landing-location__grid">
        <div className="landing-map">
          <iframe
            title={`Mapa de ubicación de ${businessName}`}
            src={MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            className="landing-map__link"
            href={MAP_LINK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={17} aria-hidden="true" />
            Abrir en Google Maps
          </a>
        </div>

        <article className="landing-location__details">
          <h3>Información de la fonda</h3>
          <div className="landing-location__list">
            {details.map((detail) => {
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
        </article>
      </div>

      <article className="landing-location__welcome">
        <span className="landing-location__welcome-icon" aria-hidden="true">
          <Utensils size={26} strokeWidth={2} />
        </span>
        <div>
          <h3>Te esperamos</h3>
          <p>
            Ven con tu familia y amigos a disfrutar el sabor de casa. Consulta nuestro horario y
            visítanos cuando la fonda esté abierta.
          </p>
        </div>
        <img src={locationFonda} alt={`Fachada de ${businessName}`} loading="lazy" />
      </article>
    </section>
  );
}
