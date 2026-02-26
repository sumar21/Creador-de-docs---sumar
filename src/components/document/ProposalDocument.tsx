"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BulbIcon,
  Calendar01Icon,
  Clock01Icon,
  CodeIcon,
  GlobeIcon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  Money01Icon,
  PackageIcon,
  Rocket01Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
  StarsIcon,
  UserGroupIcon,
  WorkflowCircle01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";

import type { DocumentData, ProposalOption } from "@/lib/types/document";

type ProposalDocumentProps = {
  data: DocumentData;
  printMode?: boolean;
  viewMode?: "stack" | "carousel";
  endAction?: React.ReactNode;
};

type HugeIconData = Parameters<typeof HugeiconsIcon>[0]["icon"];

function formatCurrency(value: number, currency: "ARS" | "USD"): string {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace(/\u00a0/g, " ");
}

function AccentLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#fffb17]">{children}</p>;
}

function ServiceItem({
  icon,
  title,
  description,
}: {
  icon: HugeIconData;
  title: string;
  description: string;
}) {
  return (
    <article className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={22} color="#fffb17" strokeWidth={1.9} />
      </span>
      <div>
        <h3 className="text-2xl font-semibold text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
    </article>
  );
}

function ProcessStep({
  index,
  icon,
  title,
  description,
}: {
  index: string;
  icon: HugeIconData;
  title: string;
  description: string;
}) {
  return (
    <article className="flex flex-col items-center text-center">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={38} color="#fffb17" strokeWidth={1.9} />
      </span>
      <p className="mt-3 text-xs font-semibold text-[#fffb17]">{index}</p>
      <h3 className="mt-1 text-2xl font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400">{description}</p>
    </article>
  );
}

function MetricItem({ value, label, icon }: { value: string; label: string; icon: HugeIconData }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={24} color="#fffb17" strokeWidth={1.9} />
      </span>
      <p className="mt-4 text-5xl font-bold leading-none text-zinc-100">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </article>
  );
}

function buildSlides(data: DocumentData, endAction?: React.ReactNode): React.ReactNode[] {
  const hasClientLogo = Boolean(data.client.logoUrl);
  const mainProposal: ProposalOption | null = data.proposals[0] ?? null;

  const estimationValue =
    mainProposal && mainProposal.total > 0 ? formatCurrency(mainProposal.total, mainProposal.currency) : "$xxx.xxx";

  const supportValue =
    mainProposal && mainProposal.total > 0
      ? formatCurrency(Math.round(mainProposal.total * 0.2), mainProposal.currency)
      : "$xx.xxx";

  return [
    <div key="s1" className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full max-w-[860px] items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div className="md:justify-self-end md:text-right">
            <Image
              src="/sumar-logo.png"
              alt="Logo Sumar"
              width={420}
              height={140}
              priority
              className="h-24 w-[360px] max-w-full object-contain md:ml-auto"
            />
          </div>

          <div className="hidden h-20 w-px bg-gradient-to-b from-transparent via-[#fffb17]/70 to-transparent md:block" />

          <div className="md:justify-self-start md:text-left">
            {hasClientLogo ? (
              <Image
                src={data.client.logoUrl ?? ""}
                alt={`Logo ${data.client.name}`}
                width={420}
                height={140}
                unoptimized
                className="h-24 w-[360px] max-w-full object-contain"
              />
            ) : (
              <p className="break-words text-3xl font-semibold text-zinc-100">{data.client.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pb-12 pt-4 text-center">
        <p className="text-2xl uppercase tracking-[0.11em] text-zinc-400">Propuesta comercial</p>
        <div className="mx-auto mt-3 h-[2px] w-20 bg-[#fffb17]" />
      </div>
    </div>,

    <div key="s2" className="grid h-full gap-0 md:grid-cols-2">
      <div className="flex flex-col justify-between pr-6">
        <div>
          <AccentLabel>Quiénes somos</AccentLabel>
          <h2 className="mt-3 text-5xl font-semibold leading-[1.02] text-zinc-100 md:text-6xl md:leading-[1]">
            Socios de tu <span className="text-[#fffb17]">Transformación</span> Digital
          </h2>
          <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-zinc-400 md:text-lg">
            Somos un equipo especializado en crear soluciones digitales a medida, que impulsa el cambio para tomar
            decisiones basada en datos gestionados.
          </p>
        </div>

        <article className="mt-7 rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#fffb17]/30 bg-[#fffb17]/10">
              <HugeiconsIcon icon={StarsIcon} size={16} color="#fffb17" strokeWidth={2} />
            </span>
            <p className="text-lg font-semibold text-[#fffda5]">100% impulsados por IA</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            La inteligencia artificial atraviesa cada uno de nuestros procesos: desde el descubrimiento hasta la entrega
            final. Potenciamos cada etapa con IA para maximizar la calidad y el valor que entregamos a cada cliente.
          </p>
        </article>
      </div>

      <div className="flex flex-col justify-center gap-4 border-l border-white/8 bg-white/[0.01] pl-6">
        <ServiceItem
          icon={CodeIcon}
          title="Digitalización"
          description="Aplicaciones enterprise (B2B) a medida con tecnología Low-Code para optimizar tus procesos core."
        />
        <ServiceItem
          icon={Analytics02Icon}
          title="Reporting & Analytics"
          description="Dashboards con Power BI para controlar tu gestión en línea desde cualquier dispositivo."
        />
        <ServiceItem
          icon={WorkflowCircle01Icon}
          title="Automatización"
          description="RPA con Power Automate para eliminar tareas repetitivas y liberar tiempo de alto valor."
        />
      </div>
    </div>,

    <div key="s3" className="flex h-full flex-col items-center justify-center text-center">
      <AccentLabel>Nuestra trayectoria</AccentLabel>
      <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 md:text-6xl">
        Números que respaldan nuestro trabajo
      </h2>

      <div className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
        <MetricItem value="40+" label="Clientes" icon={UserGroupIcon} />
        <MetricItem value="80+" label="Proyectos" icon={PackageIcon} />
        <MetricItem value="18.000+" label="Hs de Desarrollo" icon={Clock01Icon} />
      </div>
    </div>,

    <div key="s4" className="flex h-full flex-col justify-center">
      <div className="text-center">
        <AccentLabel>Metodología</AccentLabel>
        <h2 className="mt-3 text-4xl font-semibold text-zinc-100 md:text-5xl">Nuestro proceso</h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-4">
        <ProcessStep
          index="01"
          icon={Search01Icon}
          title="Descubrimiento"
          description="Analizamos tus procesos actuales, identificamos oportunidades de mejora y definimos el alcance del proyecto."
        />
        <ProcessStep
          index="02"
          icon={BulbIcon}
          title="Diseño"
          description="Prototipamos la solución, validamos con tu equipo y definimos la arquitectura técnica óptima."
        />
        <ProcessStep
          index="03"
          icon={Wrench01Icon}
          title="Desarrollo"
          description="Construimos la solución en sprints iterativos, con demos semanales para asegurar alineación continua."
        />
        <ProcessStep
          index="04"
          icon={Rocket01Icon}
          title="Despliegue"
          description="Implementamos en producción, capacitamos a tu equipo y brindamos soporte post-lanzamiento."
        />
      </div>

      <article className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 px-5 py-4 text-center text-sm leading-relaxed text-zinc-200 md:text-base">
        <span className="font-semibold text-[#fffb17]">IA integrada en cada etapa:</span> la inteligencia artificial
        potencia cada fase de nuestro proceso, acelerando resultados y maximizando la calidad de cada entregable.
      </article>
    </div>,

    <div key="s5" className="grid h-full gap-8 xl:grid-cols-2 xl:items-center xl:gap-14 xl:px-16">
      <div className="flex flex-col justify-center px-4 md:px-8 xl:px-0">
        <div>
          <AccentLabel>Propuesta</AccentLabel>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-zinc-100 md:text-5xl">Estructura y Alcance</h2>
          <p className="mt-6 max-w-[33rem] text-base leading-[1.58] text-zinc-300 md:text-lg">
            Definimos junto a vos el alcance del proyecto, asegurándonos de cubrir todas las necesidades de tu
            operación.
          </p>

          <ul className="mt-8 space-y-4 text-base text-zinc-300 md:text-lg">
            <li className="grid grid-cols-[10px_1fr] items-start gap-4">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
              <span>12–15 indicadores</span>
            </li>
            <li className="grid grid-cols-[10px_1fr] items-start gap-4">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
              <span>Filtros refinados por métricas de tiempo (u otros segmentos)</span>
            </li>
            <li className="grid grid-cols-[10px_1fr] items-start gap-4">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
              <span>3 niveles de navegación (1 KPI + 1 gráfica + 1 tabla)</span>
            </li>
            <li className="grid grid-cols-[10px_1fr] items-start gap-4">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
              <span>Integración con Tango y Sharepoint</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 inline-flex w-fit rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm italic text-zinc-400">
          (*) Propuesta válida por 10 días.
        </p>
      </div>

      <div className="relative mt-2 border-t border-white/8 px-4 pt-8 md:px-8 xl:mt-0 xl:self-center xl:border-t-0 xl:px-0 xl:pt-0">
        <div className="pointer-events-none absolute bottom-3 left-0 top-3 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[0.6px] xl:block" />

        <div className="pl-0 xl:pl-8">
          <span className="block select-none text-xs uppercase tracking-[0.16em] text-transparent">Propuesta</span>
          <h3 className="mt-3 text-4xl font-semibold text-zinc-100 md:text-5xl">Entregables (para Aplicaciones)</h3>

          <div className="mt-8 divide-y divide-white/8">
            {[
              {
                index: "01",
                title: "Documento de alcance",
                desc: "Detalle funcional y técnico del proyecto",
              },
              {
                index: "02",
                title: "Prototipo interactivo",
                desc: "Maquetas navegables para validación temprana",
              },
              {
                index: "03",
                title: "Aplicación en producción",
                desc: "Solución desplegada y lista para operar",
              },
              {
                index: "04",
                title: "Documentación técnica",
                desc: "Guías de uso y documentación del sistema",
              },
            ].map((item) => (
              <article key={item.index} className="grid grid-cols-[44px_1fr] gap-4 py-6">
                <p className="pt-1 text-sm font-semibold tracking-[0.06em] text-[#fffb17]">{item.index}</p>
                <div>
                  <p className="text-2xl font-semibold text-zinc-100">{item.title}</p>
                  <p className="mt-2 text-base leading-[1.58] text-zinc-400">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>,

    <div key="s6" className="flex h-full flex-col gap-6">
      <div className="mx-auto max-w-5xl text-center">
        <AccentLabel>Inversión</AccentLabel>
        <h2 className="mt-2 text-4xl font-semibold leading-[1.06] text-zinc-100 md:text-5xl">Propuesta Económica</h2>
        <p className="mx-auto mt-4 max-w-[56rem] text-base leading-relaxed text-zinc-400 md:text-lg">
          Proponemos un modelo de contratación híbrido de pago por desarrollo de única vez + hs de soporte por plazo
          determinado, según el alcance definido en conjunto.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2 md:gap-5">
        <article className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.02] p-6">
          <p className="text-3xl font-semibold text-zinc-100">Estimación</p>
          <p className="mt-4 break-words text-5xl font-bold leading-none text-[#fffb17] md:text-6xl">{estimationValue}</p>
          <p className="mt-3 text-xl font-semibold text-zinc-200">
            Valor hs Soporte: <span className="text-[#fffb17]">{supportValue}</span>
          </p>

          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-300 md:text-base">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#fffb17]" />
              <span>Diseño y desarrollo completo</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#fffb17]" />
              <span>Integraciones necesarias</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#fffb17]" />
              <span>Testing y QA</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#fffb17]" />
              <span>Deploy en producción</span>
            </li>
          </ul>
        </article>

        <div className="grid h-full gap-3 [grid-template-rows:repeat(3,minmax(0,auto))_minmax(0,1fr)]">
          {[
            {
              title: "Pago único",
              text: "50% Anticipo + 50% a los 30 días.",
              icon: Money01Icon,
            },
            {
              title: "Entrega programada",
              text: "45 días desde el día del pago del anticipo.",
              icon: Calendar01Icon,
            },
            {
              title: "Garantía",
              text: "Soporte de 15 días (corridos) post-lanzamiento incluido para asegurar la estabilidad.",
              icon: Shield01Icon,
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/12 bg-white/[0.02] p-4 md:p-5">
              <div className="flex gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
                  <HugeiconsIcon icon={item.icon} size={21} color="#fffb17" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="text-xl font-semibold text-zinc-100">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.text}</p>
                </div>
              </div>
            </article>
          ))}
          <article className="rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 px-4 py-4 text-sm leading-relaxed text-zinc-300 md:text-base">
            Se recomienda la contratación anticipada de un set de horas de Soporte para los dos o tres meses
            posteriores a la implementación, de manera que se pueda iterar el Dashboard en caso de encontrar hallazgos
            de oportunidades de mejora post-uso.
          </article>
        </div>
      </div>

      {data.proposals.length > 1 ? (
        <article className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-3 text-sm text-zinc-300">
          Opciones adicionales: {data.proposals.slice(1).map((p) => `${p.title} (${formatCurrency(p.total, p.currency)})`).join(" · ")}
        </article>
      ) : null}

    </div>,

    <div key="s7" className="flex h-full flex-col items-center justify-center">
      <AccentLabel>Próximos pasos</AccentLabel>
      <h2 className="mt-3 text-center text-4xl font-semibold text-zinc-100 md:text-5xl">¿Cómo seguimos?</h2>

      <div className="mt-8 w-full max-w-3xl space-y-5">
        {[
          {
            number: "1",
            title: "Aprobación y arranque",
            desc: "Confirmamos el presupuesto, firmamos y comenzamos el desarrollo.",
          },
          {
            number: "2",
            title: "Agendar reunión de kick-off",
            desc: "Coordinamos una reunión para definir equipo, cronograma y primeras prioridades.",
          },
          {
            number: "3",
            title: "Relevamiento detallado",
            desc: "Refinamos los KPI's que se desean construir, las bases de origen y evaluamos consumo de los datos.",
          },
        ].map((item, idx, arr) => (
          <article key={item.number} className="relative flex gap-4">
            <div className="relative flex w-12 shrink-0 justify-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fffb17] text-lg font-bold text-black">
                {item.number}
              </span>
              {idx < arr.length - 1 ? <span className="absolute top-10 h-[5.8rem] w-px bg-white/15" /> : null}
            </div>
            <div className="pt-0.5">
              <h3 className="text-2xl font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-zinc-400">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <article className="mt-8 w-full max-w-xl rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 px-5 py-3 text-center text-lg text-zinc-100">
        <span className="mr-1 inline-flex align-middle text-[#fffb17]">
          <HugeiconsIcon icon={SparklesIcon} size={18} color="#fffb17" strokeWidth={1.9} />
        </span>
        ¿Listo para arrancar? ¡Comencemos!
      </article>
    </div>,

    <div key="s8" className="flex h-full flex-col items-center justify-center text-center">
      <Image
        src="/sumar-logo.png"
        alt="Logo Sumar"
        width={280}
        height={102}
        priority
        className="h-auto w-[240px] max-w-full object-contain"
      />
      <h2 className="mt-10 text-5xl font-semibold text-zinc-100 md:text-6xl">
        Hagamos que <span className="text-[#fffb17]">suceda</span>
      </h2>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300">
        <a
          href="https://www.sumar.dev/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
        >
          <HugeiconsIcon icon={GlobeIcon} size={16} color="#fffb17" strokeWidth={1.9} />
          www.sumar.dev
        </a>
        <a
          href="mailto:cotizaciones@sumardigital.com.ar"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
        >
          <HugeiconsIcon icon={Mail01Icon} size={16} color="#fffb17" strokeWidth={1.9} />
          cotizaciones@sumardigital.com.ar
        </a>
        <a
          href="https://www.linkedin.com/company/sumar-digital/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
        >
          <HugeiconsIcon icon={Linkedin01Icon} size={16} color="#fffb17" strokeWidth={1.9} />
          LinkedIn
        </a>
        <a
          href="https://www.instagram.com/sumardigital/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
        >
          <HugeiconsIcon icon={InstagramIcon} size={16} color="#fffb17" strokeWidth={1.9} />
          Instagram
        </a>
      </div>

      {endAction ? <div className="mt-8">{endAction}</div> : null}
    </div>,
  ];
}

export function ProposalDocument({ data, printMode = false, viewMode = "stack", endAction }: ProposalDocumentProps) {
  const slides = useMemo(() => buildSlides(data, endAction), [data, endAction]);
  const [activeIndex, setActiveIndex] = useState(0);

  const isCarousel = !printMode && viewMode === "carousel";
  const totalSlides = slides.length;
  const currentIndex = Math.min(activeIndex, Math.max(totalSlides - 1, 0));

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      const clamped = Math.min(prev, totalSlides - 1);
      return Math.min(clamped + 1, totalSlides - 1);
    });
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => {
      const clamped = Math.min(prev, totalSlides - 1);
      return Math.max(clamped - 1, 0);
    });
  }, [totalSlides]);

  useEffect(() => {
    if (!isCarousel) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, isCarousel]);

  if (!isCarousel) {
    return (
      <div className="sumar-slide-deck">
        {slides.map((slide, index) => (
          <section key={index} className="sumar-slide">
            <div className="sumar-slide-content">{slide}</div>
          </section>
        ))}
      </div>
    );
  }

  const progressWidth = `${((currentIndex + 1) / totalSlides) * 100}%`;

  return (
    <div className="sumar-carousel">
      <div className="sumar-carousel-frame">
        <AnimatePresence mode="wait">
          <motion.section
            key={currentIndex}
            className="sumar-slide sumar-slide-carousel"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.24 }}
          >
            <div className="sumar-slide-content">{slides[currentIndex]}</div>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="sumar-carousel-controls" aria-label="Navegación de slides">
        <button
          type="button"
          className="sumar-carousel-button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Slide anterior"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="currentColor" strokeWidth={2} />
        </button>

        <span className="sumar-carousel-index">
          {currentIndex + 1} / {totalSlides}
        </span>

        <button
          type="button"
          className="sumar-carousel-button"
          onClick={goNext}
          disabled={currentIndex === totalSlides - 1}
          aria-label="Slide siguiente"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={2} />
        </button>
      </div>

      <div className="sumar-carousel-progress-track" aria-hidden>
        <motion.div className="sumar-carousel-progress-fill" animate={{ width: progressWidth }} transition={{ duration: 0.2 }} />
      </div>
    </div>
  );
}
