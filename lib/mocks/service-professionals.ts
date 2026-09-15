// Relación (mock) entre servicios y profesionales: qué profesional puede
// realizar cada servicio. Es una tabla de unión igual que la que tendría
// una base de datos real; se administra como datos, no como lógica. Si un
// servicio no aparece aquí, se asume que cualquier profesional activa
// puede realizarlo (ver getProfessionalsForService en
// lib/utils/professionals.ts), para que un servicio nuevo no quede sin
// nadie disponible mientras se configura su relación.

import { ServiceProfessional } from "../types";
import { profCamila, profLupita, profVanessa } from "./professionals";

export const mockServiceProfessionals: ServiceProfessional[] = [
  // Pestañas
  { serviceId: "svc-pestanas-lifting", professionalId: profCamila.id },
  { serviceId: "svc-pestanas-lifting", professionalId: profVanessa.id },
  { serviceId: "svc-pestanas-clasicas", professionalId: profCamila.id },
  { serviceId: "svc-pestanas-clasicas", professionalId: profVanessa.id },
  { serviceId: "svc-pestanas-volumen-ruso", professionalId: profCamila.id },
  { serviceId: "svc-pestanas-volumen-ruso", professionalId: profVanessa.id },

  // Micropigmentación de cejas
  { serviceId: "svc-cejas-microblading", professionalId: profLupita.id },
  { serviceId: "svc-cejas-microblading", professionalId: profVanessa.id },
  { serviceId: "svc-cejas-diseno-henna", professionalId: profLupita.id },
  { serviceId: "svc-cejas-retoque", professionalId: profLupita.id },
  { serviceId: "svc-cejas-retoque", professionalId: profVanessa.id },

  // Micropigmentación de labios
  { serviceId: "svc-labios-micropigmentacion", professionalId: profLupita.id },
  { serviceId: "svc-micro-labios-perfilado", professionalId: profLupita.id },
  { serviceId: "svc-labios-retoque", professionalId: profLupita.id },

  // Colorización y tintes
  { serviceId: "svc-color-tinte-completo", professionalId: profVanessa.id },
  { serviceId: "svc-color-balayage", professionalId: profVanessa.id },
  { serviceId: "svc-color-retoque-raiz", professionalId: profVanessa.id },

  // Maquillaje
  { serviceId: "svc-maquillaje-social", professionalId: profCamila.id },
  { serviceId: "svc-maquillaje-social", professionalId: profVanessa.id },
  { serviceId: "svc-maquillaje-novia", professionalId: profVanessa.id },
  { serviceId: "svc-maquillaje-sesion-fotos", professionalId: profCamila.id },
];
