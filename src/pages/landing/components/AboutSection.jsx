import { Heart, Leaf, Users } from 'lucide-react';
import aboutKitchen from '../../../shared/assets/images/about-kitchen.jpg';
import aboutMission from '../../../shared/assets/images/about-mission.jpg';

const VALUES = [
  {
    icon: Leaf,
    title: 'Ingredientes locales',
    description: 'Trabajamos con productores de la región para ofrecerte lo más fresco cada día.',
  },
  {
    icon: Heart,
    title: 'Hecho con amor',
    description: 'Cada platillo es preparado con dedicación y el toque casero que nos distingue.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Más que una fonda, somos parte de nuestra comunidad y su tradición.',
  },
];

export function AboutSection() {
  return (
    <section className="landing-section landing-about" id="nosotros" aria-labelledby="about-title">
      <header className="landing-section__header">
        <h2 id="about-title">Nosotros</h2>
        <p>
          En fonda PuraVida creamos platillos caseros con ingredientes locales y frescos, para
          brindarte el sabor auténtico de nuestra tierra.
        </p>
      </header>

      <img
        className="landing-about__hero"
        src={aboutKitchen}
        alt="Cocinera preparando ingredientes frescos en la fonda"
        loading="lazy"
      />

      <div className="landing-about__values">
        {VALUES.map((value) => {
          const Icon = value.icon;

          return (
            <article className="landing-value-card" key={value.title}>
              <span className="landing-value-card__icon" aria-hidden="true">
                <Icon size={24} strokeWidth={2} />
              </span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          );
        })}
      </div>

      <article className="landing-mission">
        <img
          className="landing-mission__image"
          src={aboutMission}
          alt="Platillos caseros preparados con ingredientes frescos"
          loading="lazy"
        />
        <div className="landing-mission__content">
          <h3>Nuestra misión</h3>
          <p>
            Ofrecer comida casera, nutritiva y deliciosa, que conecte a las personas con los
            sabores de hogar y nuestra cultura.
          </p>
        </div>
      </article>
    </section>
  );
}
