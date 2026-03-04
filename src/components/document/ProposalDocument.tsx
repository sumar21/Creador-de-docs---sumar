"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BulbIcon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CodeIcon,
  FullScreenIcon,
  GlobeIcon,
  GridViewIcon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  MinimizeScreenIcon,
  Money01Icon,
  PackageIcon,
  Rocket01Icon,
  Search01Icon,
  Shield01Icon,
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

const noopSubscribe = () => () => {};
const premiumEase = [0.22, 1, 0.36, 1] as const;

const slideSequenceVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.06,
    },
  },
};

const nestedSequenceVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const textRevealVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.52,
      ease: premiumEase,
    },
  },
};

const blockRevealVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.46,
      ease: premiumEase,
    },
  },
};

type AnimatedProps = {
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
};

function SlideSequence({ children, className, animate = true }: AnimatedProps) {
  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={slideSequenceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

function TextReveal({ children, className, animate = true }: AnimatedProps) {
  if (!animate) {
    if (!className) {
      return <>{children}</>;
    }

    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={textRevealVariants}>
      {children}
    </motion.div>
  );
}

function BlockReveal({ children, className, animate = true }: AnimatedProps) {
  if (!animate) {
    if (!className) {
      return <>{children}</>;
    }

    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={blockRevealVariants}>
      {children}
    </motion.div>
  );
}

function formatCurrency(value: number, currency: "ARS" | "USD"): string {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace(/\u00a0/g, " ");
}

function AccentLabel({ children, animate = true }: { children: React.ReactNode; animate?: boolean }) {
  if (!animate) {
    return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#fffb17]">{children}</p>;
  }

  return (
    <motion.p variants={textRevealVariants} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#fffb17]">
      {children}
    </motion.p>
  );
}

function ServiceItem({
  icon,
  title,
  description,
  animate = true,
}: {
  icon: HugeIconData;
  title: string;
  description: string;
  animate?: boolean;
}) {
  if (!animate) {
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

  return (
    <motion.article className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4" variants={blockRevealVariants}>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={22} color="#fffb17" strokeWidth={1.9} />
      </span>
      <motion.div variants={nestedSequenceVariants}>
        <motion.h3 className="text-2xl font-semibold text-zinc-100" variants={textRevealVariants}>
          {title}
        </motion.h3>
        <motion.p className="mt-1 text-sm leading-relaxed text-zinc-400" variants={textRevealVariants}>
          {description}
        </motion.p>
      </motion.div>
    </motion.article>
  );
}

function ProcessStep({
  index,
  icon,
  title,
  description,
  connectToNext = false,
  animate = true,
}: {
  index: string;
  icon: HugeIconData;
  title: string;
  description: string;
  connectToNext?: boolean;
  animate?: boolean;
}) {
  if (!animate) {
    return (
      <article className="relative flex flex-col items-center text-center">
        {connectToNext ? (
          <span className="pointer-events-none absolute left-1/2 top-10 z-0 hidden h-[2px] w-[calc(100%+24px)] -translate-y-1/2 bg-[#c8c700]/70 md:block" />
        ) : null}
        <span className="relative z-10 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#fffb17]/30 bg-[#232207] text-[#fffb17]">
          <HugeiconsIcon icon={icon} size={38} color="#fffb17" strokeWidth={1.9} />
        </span>
        <p className="mt-3 text-xs font-semibold text-[#fffb17]">{index}</p>
        <h3 className="mt-1 text-2xl font-semibold text-zinc-100">{title}</h3>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400">{description}</p>
      </article>
    );
  }

  return (
    <motion.article className="relative flex flex-col items-center text-center" variants={blockRevealVariants}>
      {connectToNext ? (
        <span className="pointer-events-none absolute left-1/2 top-10 z-0 hidden h-[2px] w-[calc(100%+24px)] -translate-y-1/2 bg-[#c8c700]/70 md:block" />
      ) : null}
      <span className="relative z-10 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#fffb17]/30 bg-[#232207] text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={38} color="#fffb17" strokeWidth={1.9} />
      </span>
      <motion.p className="mt-3 text-xs font-semibold text-[#fffb17]" variants={textRevealVariants}>
        {index}
      </motion.p>
      <motion.h3 className="mt-1 text-2xl font-semibold text-zinc-100" variants={textRevealVariants}>
        {title}
      </motion.h3>
      <motion.p className="mt-1 max-w-xs text-sm leading-relaxed text-zinc-400" variants={textRevealVariants}>
        {description}
      </motion.p>
    </motion.article>
  );
}

function MetricItem({
  value,
  label,
  icon,
  animate = true,
}: {
  value: string;
  label: string;
  icon: HugeIconData;
  animate?: boolean;
}) {
  if (!animate) {
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

  return (
    <motion.article className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-center" variants={blockRevealVariants}>
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#fffb17]/30 bg-[#fffb17]/10 text-[#fffb17]">
        <HugeiconsIcon icon={icon} size={24} color="#fffb17" strokeWidth={1.9} />
      </span>
      <motion.p className="mt-4 text-5xl font-bold leading-none text-zinc-100" variants={textRevealVariants}>
        {value}
      </motion.p>
      <motion.p className="mt-1 text-sm text-zinc-400" variants={textRevealVariants}>
        {label}
      </motion.p>
    </motion.article>
  );
}

function buildSlides(data: DocumentData, endAction?: React.ReactNode, animate = true): React.ReactNode[] {
  const hasClientLogo = Boolean(data.client.logoUrl);
  const mainProposal: ProposalOption | null = data.proposals[0] ?? null;
  const scopeItems = [
    "12–15 indicadores",
    "Filtros refinados por métricas de tiempo (u otros segmentos)",
    "3 niveles de navegación (1 KPI + 1 gráfica + 1 tabla)",
    "Integración con Tango y Sharepoint",
  ];
  const deliverables = [
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
  ];
  const includedItems = ["Diseño y desarrollo completo", "Integraciones necesarias", "Testing y QA", "Deploy en producción"];
  const economicCards = [
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
  ];
  const nextSteps = [
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
  ];
  const contactLinks: Array<{
    href: string;
    label: string;
    icon: HugeIconData;
    external?: boolean;
  }> = [
    { href: "https://www.sumar.dev/", label: "www.sumar.dev", icon: GlobeIcon, external: true },
    { href: "mailto:cotizaciones@sumardigital.com.ar", label: "cotizaciones@sumardigital.com.ar", icon: Mail01Icon },
    { href: "https://www.linkedin.com/company/sumar-digital/", label: "LinkedIn", icon: Linkedin01Icon, external: true },
    { href: "https://www.instagram.com/sumardigital/", label: "Instagram", icon: InstagramIcon, external: true },
  ];

  const estimationValue =
    mainProposal && mainProposal.total > 0 ? formatCurrency(mainProposal.total, mainProposal.currency) : "$xxx.xxx";

  const supportValue =
    mainProposal && mainProposal.total > 0
      ? formatCurrency(Math.round(mainProposal.total * 0.2), mainProposal.currency)
      : "$xx.xxx";

  return [
    <SlideSequence key="s1" animate={animate} className="sumar-reference-scale flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full max-w-[860px] items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <BlockReveal animate={animate}>
            <div className="md:justify-self-end md:text-right">
              <Image
                src="/sumar-logo.png"
                alt="Logo Sumar"
                width={420}
                height={140}
                priority
                sizes="(max-width: 768px) 80vw, 360px"
                className="h-24 w-[360px] max-w-full object-contain md:ml-auto"
              />
            </div>
          </BlockReveal>

          <BlockReveal animate={animate} className="hidden h-20 w-px bg-gradient-to-b from-transparent via-[#fffb17]/70 to-transparent md:block" />

          <div className="md:justify-self-start md:text-left">
            {hasClientLogo ? (
              <BlockReveal animate={animate}>
                <Image
                  src={data.client.logoUrl ?? ""}
                  alt={`Logo ${data.client.name}`}
                  width={420}
                  height={140}
                  unoptimized
                  loading="eager"
                  sizes="(max-width: 768px) 80vw, 360px"
                  className="h-24 w-[360px] max-w-full object-contain"
                />
              </BlockReveal>
            ) : (
              <TextReveal animate={animate}>
                <p className="break-words text-3xl font-semibold text-zinc-100">{data.client.name}</p>
              </TextReveal>
            )}
          </div>
        </div>
      </div>

      <div className="pb-12 pt-4 text-center">
        <TextReveal animate={animate}>
          <p className="text-2xl uppercase tracking-[0.11em] text-zinc-400">Propuesta comercial</p>
        </TextReveal>
        <BlockReveal animate={animate} className="mx-auto mt-3 h-[2px] w-20 bg-[#fffb17]" />
      </div>
    </SlideSequence>,

    <SlideSequence key="s2" animate={animate} className="sumar-reference-scale grid h-full gap-0 md:grid-cols-2">
      <div className="flex flex-col justify-between pr-6">
        <div>
          <AccentLabel animate={animate}>Quiénes somos</AccentLabel>
          <TextReveal animate={animate}>
            <h2 className="mt-3 text-5xl font-semibold leading-[1.02] text-zinc-100 md:text-6xl md:leading-[1]">
              Socios de tu <span className="text-[#fffb17]">Transformación</span> Digital
            </h2>
          </TextReveal>
          <TextReveal animate={animate}>
            <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-zinc-400 md:text-lg">
              Somos un equipo especializado en crear soluciones digitales a medida, que impulsa el cambio para tomar
              decisiones basada en datos gestionados.
            </p>
          </TextReveal>
        </div>

        <BlockReveal animate={animate}>
          <article className="mt-7 rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#fffb17]/30 bg-[#fffb17]/10">
                <HugeiconsIcon icon={StarsIcon} size={16} color="#fffb17" strokeWidth={2} />
              </span>
              <TextReveal animate={animate}>
                <p className="text-lg font-semibold text-[#fffda5]">100% impulsados por IA</p>
              </TextReveal>
            </div>
            <TextReveal animate={animate}>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                Integramos IA en cada etapa para acelerar entregas y elevar la calidad, con impacto real en tu
                operación.
              </p>
            </TextReveal>
          </article>
        </BlockReveal>
      </div>

      <div className="flex flex-col justify-center gap-4 border-l border-white/8 bg-white/[0.01] pl-6">
        <ServiceItem
          icon={CodeIcon}
          title="Digitalización"
          description="Aplicaciones enterprise (B2B) a medida con tecnología Low-Code para optimizar tus procesos core."
          animate={animate}
        />
        <ServiceItem
          icon={Analytics02Icon}
          title="Reporting & Analytics"
          description="Dashboards con Power BI para controlar tu gestión en línea desde cualquier dispositivo."
          animate={animate}
        />
        <ServiceItem
          icon={WorkflowCircle01Icon}
          title="Automatización"
          description="RPA con Power Automate para eliminar tareas repetitivas y liberar tiempo de alto valor."
          animate={animate}
        />
      </div>
    </SlideSequence>,

    <SlideSequence key="s3" animate={animate} className="sumar-reference-scale flex h-full flex-col items-center justify-center text-center">
      <AccentLabel animate={animate}>Nuestra trayectoria</AccentLabel>
      <TextReveal animate={animate}>
        <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 md:text-6xl">
          Números que respaldan nuestro trabajo
        </h2>
      </TextReveal>

      <div className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
        <MetricItem value="40+" label="Clientes" icon={UserGroupIcon} animate={animate} />
        <MetricItem value="80+" label="Proyectos" icon={PackageIcon} animate={animate} />
        <MetricItem value="18.000+" label="Hs de Desarrollo" icon={Clock01Icon} animate={animate} />
      </div>
    </SlideSequence>,

    <SlideSequence key="s4" animate={animate} className="sumar-reference-scale flex h-full flex-col justify-center">
      <div className="text-center">
        <AccentLabel animate={animate}>Metodología</AccentLabel>
        <TextReveal animate={animate}>
          <h2 className="mt-3 text-4xl font-semibold text-zinc-100 md:text-5xl">Nuestro proceso</h2>
        </TextReveal>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-4">
        <ProcessStep
          index="01"
          icon={Search01Icon}
          title="Descubrimiento"
          description="Analizamos tus procesos actuales, identificamos oportunidades de mejora y definimos el alcance del proyecto."
          connectToNext
          animate={animate}
        />
        <ProcessStep
          index="02"
          icon={BulbIcon}
          title="Diseño"
          description="Prototipamos la solución, validamos con tu equipo y definimos la arquitectura técnica óptima."
          connectToNext
          animate={animate}
        />
        <ProcessStep
          index="03"
          icon={Wrench01Icon}
          title="Desarrollo"
          description="Construimos la solución en sprints iterativos, con demos semanales para asegurar alineación continua."
          connectToNext
          animate={animate}
        />
        <ProcessStep
          index="04"
          icon={Rocket01Icon}
          title="Despliegue"
          description="Implementamos en producción, capacitamos a tu equipo y brindamos soporte post-lanzamiento."
          animate={animate}
        />
      </div>

      <BlockReveal animate={animate}>
        <article className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-[#fffb17]/25 bg-[#fffb17]/8 px-5 py-4 text-center text-sm leading-relaxed text-zinc-200 md:text-base">
          <TextReveal animate={animate}>
            <p>
              <span className="font-semibold text-[#fffb17]">IA integrada en cada etapa:</span> la inteligencia
              artificial potencia cada fase de nuestro proceso, acelerando resultados y maximizando la calidad de cada
              entregable.
            </p>
          </TextReveal>
        </article>
      </BlockReveal>
    </SlideSequence>,

    <SlideSequence key="s5" animate={animate} className="sumar-reference-scale grid h-full gap-8 xl:grid-cols-2 xl:items-center xl:gap-14 xl:px-16">
      <div className="flex flex-col justify-center px-4 md:px-8 xl:px-0">
        <div>
          <AccentLabel animate={animate}>Propuesta</AccentLabel>
          <TextReveal animate={animate}>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-zinc-100 md:text-5xl">Estructura y Alcance</h2>
          </TextReveal>
          <TextReveal animate={animate}>
            <p className="mt-6 max-w-[33rem] text-base leading-[1.58] text-zinc-300 md:text-lg">
              Definimos junto a vos el alcance del proyecto, asegurándonos de cubrir todas las necesidades de tu
              operación.
            </p>
          </TextReveal>

          {animate ? (
            <motion.ul className="mt-8 space-y-4 text-base text-zinc-300 md:text-lg" variants={nestedSequenceVariants}>
              {scopeItems.map((item) => (
                <motion.li key={item} className="grid grid-cols-[10px_1fr] items-start gap-4" variants={textRevealVariants}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <ul className="mt-8 space-y-4 text-base text-zinc-300 md:text-lg">
              {scopeItems.map((item) => (
                <li key={item} className="grid grid-cols-[10px_1fr] items-start gap-4">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#fffb17]/85" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <TextReveal animate={animate}>
          <p className="mt-8 inline-flex w-fit rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm italic text-zinc-400">
            (*) Propuesta válida por 10 días.
          </p>
        </TextReveal>
      </div>

      <div className="relative mt-2 border-t border-white/8 px-4 pt-8 md:px-8 xl:mt-0 xl:self-center xl:border-t-0 xl:px-0 xl:pt-0">
        <div className="pointer-events-none absolute bottom-3 left-0 top-3 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[0.6px] xl:block" />

        <div className="pl-0 xl:pl-8">
          <TextReveal animate={animate}>
            <span className="block select-none text-xs uppercase tracking-[0.16em] text-transparent">Propuesta</span>
          </TextReveal>
          <TextReveal animate={animate}>
            <h3 className="mt-3 text-4xl font-semibold text-zinc-100 md:text-5xl">Entregables (para Aplicaciones)</h3>
          </TextReveal>

          <div className="mt-8 divide-y divide-white/8">
            {deliverables.map((item) => (
              <BlockReveal key={item.index} animate={animate}>
                <article className="grid grid-cols-[44px_1fr] gap-4 py-6">
                  <TextReveal animate={animate}>
                    <p className="pt-1 text-sm font-semibold tracking-[0.06em] text-[#fffb17]">{item.index}</p>
                  </TextReveal>
                  <div>
                    <TextReveal animate={animate}>
                      <p className="text-2xl font-semibold text-zinc-100">{item.title}</p>
                    </TextReveal>
                    <TextReveal animate={animate}>
                      <p className="mt-2 text-base leading-[1.58] text-zinc-400">{item.desc}</p>
                    </TextReveal>
                  </div>
                </article>
              </BlockReveal>
            ))}
          </div>
        </div>
      </div>
    </SlideSequence>,

    <SlideSequence key="s6" animate={animate} className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-56 -top-48 h-[420px] w-[420px] rounded-full bg-[#dfda0a]/10 blur-[95px]" />

      <div className="relative mx-auto flex h-full w-full max-w-[1029px] flex-col justify-center gap-[25px]">
        <div className="w-full">
          <TextReveal animate={animate}>
            <h2 className="text-[45px] font-medium leading-[0.96] tracking-[-0.02em] text-zinc-100">
              Propuesta <span className="text-[#dfda0a]">económica</span>
            </h2>
          </TextReveal>
          <TextReveal animate={animate}>
            <p className="mt-3 text-[16px] leading-[1.05] tracking-[-0.02em] text-[#9d9d9d]">
              Proponemos un modelo de contratación híbrido de pago por desarrollo de única vez + hs de soporte por
              plazo determinado, según el alcance definido en conjunto.
            </p>
          </TextReveal>
        </div>

        <div className="grid min-h-0 gap-4 lg:h-[393px] lg:grid-cols-[374px_minmax(0,1fr)] lg:gap-[22px]">
          <BlockReveal animate={animate}>
            <article className="flex h-full min-h-[360px] flex-col justify-between rounded-2xl border border-[#1c1c21] bg-[#0e0e10] p-5">
              <div className="space-y-5">
                <TextReveal animate={animate}>
                  <p className="text-[24px] font-semibold leading-none text-zinc-100">Estimación</p>
                </TextReveal>
                <TextReveal animate={animate}>
                  <p className="break-words text-[38px] font-bold leading-none tracking-[-0.02em] text-[#dfda0a]">
                    {estimationValue}
                  </p>
                </TextReveal>
                <TextReveal animate={animate}>
                  <p className="text-[19px] tracking-[-0.02em] text-zinc-100">
                    <span className="font-normal">Valor hs soporte:</span>{" "}
                    <span className="font-bold text-[#dfda0a]">{supportValue}</span>
                  </p>
                </TextReveal>
              </div>

              {animate ? (
                <motion.ul className="mt-6 space-y-3" variants={nestedSequenceVariants}>
                  {includedItems.map((item) => (
                    <motion.li key={item} className="flex items-center gap-3" variants={textRevealVariants}>
                      <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#dfda0a]">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="#0e0e10" strokeWidth={2.2} />
                      </span>
                      <span className="text-[16px] tracking-[-0.02em] text-zinc-100">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <ul className="mt-6 space-y-3">
                  {includedItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#dfda0a]">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="#0e0e10" strokeWidth={2.2} />
                      </span>
                      <span className="text-[16px] tracking-[-0.02em] text-zinc-100">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </BlockReveal>

          <div className="grid h-full gap-3 [grid-template-rows:repeat(3,minmax(0,auto))_minmax(0,1fr)]">
            {economicCards.map((item) => (
              <BlockReveal key={item.title} animate={animate}>
                <article className="rounded-[10px] border border-[#2c2c2c] p-[15px]">
                  <div className="flex gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#58570a] bg-[#232207]">
                      <HugeiconsIcon icon={item.icon} size={20} color="#dfda0a" strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <TextReveal animate={animate}>
                        <p className="text-[18px] font-medium leading-none text-zinc-100">{item.title}</p>
                      </TextReveal>
                      <TextReveal animate={animate}>
                        <p className="mt-2 text-[15px] leading-[1.25] text-[#a0a0a0]">{item.text}</p>
                      </TextReveal>
                    </div>
                  </div>
                </article>
              </BlockReveal>
            ))}

            <BlockReveal animate={animate}>
              <article className="flex rounded-[10px] border border-[#58570a] bg-[#232207] p-5">
                <TextReveal animate={animate}>
                  <p className="text-[14px] font-normal leading-[1.45] text-[#fff600]">
                    Se recomienda la contratación anticipada de un set de horas de Soporte para los dos o tres meses
                    posteriores a la implementación, de manera que se pueda iterar el Dashboard en caso de encontrar
                    hallazgos de oportunidades de mejora post-uso.
                  </p>
                </TextReveal>
              </article>
            </BlockReveal>
          </div>
        </div>

        {data.proposals.length > 1 ? (
          <BlockReveal animate={animate}>
            <article className="rounded-[10px] border border-[#2c2c2c] bg-black/25 px-4 py-2 text-[12px] text-[#a0a0a0]">
              Opciones adicionales:{" "}
              {data.proposals
                .slice(1)
                .map((p) => `${p.title} (${formatCurrency(p.total, p.currency)})`)
                .join(" · ")}
            </article>
          </BlockReveal>
        ) : null}
      </div>
    </SlideSequence>,

    <SlideSequence key="s7" animate={animate} className="sumar-reference-scale flex h-full flex-col items-center justify-center">
      <AccentLabel animate={animate}>Próximos pasos</AccentLabel>
      <TextReveal animate={animate}>
        <h2 className="mt-3 text-center text-4xl font-semibold text-zinc-100 md:text-5xl">¿Cómo seguimos?</h2>
      </TextReveal>

      <div className="mt-10 w-full max-w-3xl space-y-8">
        {nextSteps.map((item, idx, arr) => (
          <BlockReveal key={item.number} animate={animate}>
            <article className="relative flex gap-5">
              <div className="relative flex w-12 shrink-0 justify-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fffb17] text-lg font-bold text-black">
                  {item.number}
                </span>
                {idx < arr.length - 1 ? <span className="absolute top-10 h-[7.4rem] w-px bg-white/15" /> : null}
              </div>
              <div className="pt-1">
                <TextReveal animate={animate}>
                  <h3 className="text-2xl font-semibold text-zinc-100">{item.title}</h3>
                </TextReveal>
                <TextReveal animate={animate}>
                  <p className="mt-2 text-base leading-[1.75] text-zinc-400">{item.desc}</p>
                </TextReveal>
              </div>
            </article>
          </BlockReveal>
        ))}
      </div>
    </SlideSequence>,

    <SlideSequence key="s8" animate={animate} className="sumar-reference-scale flex h-full flex-col items-center justify-center text-center">
      <BlockReveal animate={animate}>
        <Image
          src="/sumar-logo.png"
          alt="Logo Sumar"
          width={280}
          height={102}
          loading="lazy"
          sizes="240px"
          className="h-auto w-[240px] max-w-full object-contain"
        />
      </BlockReveal>
      <TextReveal animate={animate}>
        <h2 className="mt-10 text-5xl font-semibold text-zinc-100 md:text-6xl">
          Hagamos que <span className="text-[#fffb17]">suceda</span>
        </h2>
      </TextReveal>

      {animate ? (
        <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300" variants={nestedSequenceVariants}>
          {contactLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
              variants={blockRevealVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.22, ease: premiumEase }}
            >
              <HugeiconsIcon icon={link.icon} size={16} color="#fffb17" strokeWidth={1.9} />
              {link.label}
            </motion.a>
          ))}
        </motion.div>
      ) : (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 transition hover:border-[#fffb17]/60 hover:text-[#fffda5]"
            >
              <HugeiconsIcon icon={link.icon} size={16} color="#fffb17" strokeWidth={1.9} />
              {link.label}
            </a>
          ))}
        </div>
      )}

      {endAction ? <BlockReveal animate={animate} className="mt-8">{endAction}</BlockReveal> : null}
    </SlideSequence>,
  ];
}

export function ProposalDocument({ data, printMode = false, viewMode = "stack", endAction }: ProposalDocumentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isCarousel = !printMode && viewMode === "carousel";
  const shouldAnimateSlides = !printMode && !prefersReducedMotion && !isGridView;
  const slides = useMemo(
    () => buildSlides(data, endAction, shouldAnimateSlides),
    [data, endAction, shouldAnimateSlides],
  );
  const totalSlides = slides.length;
  const currentIndex = Math.min(activeIndex, Math.max(totalSlides - 1, 0));
  const canUseFullscreen = useSyncExternalStore(
    noopSubscribe,
    () => typeof document.documentElement.requestFullscreen === "function",
    () => false
  );

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

  const selectSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setIsGridView(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!canUseFullscreen) {
      return;
    }

    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }, [canUseFullscreen]);

  useEffect(() => {
    if (!isCarousel) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isGridView) {
        event.preventDefault();
        setIsGridView(false);
        return;
      }

      if (isGridView) {
        return;
      }

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
  }, [goNext, goPrev, isCarousel, isGridView]);

  useEffect(() => {
    if (!canUseFullscreen) {
      return;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [canUseFullscreen]);

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

  const progressWidth = totalSlides > 0 ? `${((currentIndex + 1) / totalSlides) * 100}%` : "0%";

  return (
    <div className={`sumar-carousel ${isGridView ? "sumar-carousel-grid-open" : ""}`}>
      {isGridView ? (
        <section className="sumar-slide-grid-view" aria-label="Todas las slides">
          <header className="sumar-slide-grid-header">
            <h2 className="sumar-slide-grid-title">Todas las slides</h2>
            <button
              type="button"
              className="sumar-slide-grid-close"
              onClick={() => setIsGridView(false)}
              aria-label="Cerrar vista grilla"
            >
              Cerrar vista grilla
            </button>
          </header>

          <div className="sumar-slide-grid">
            {slides.map((slide, index) => (
              <article
                key={index}
                className={`sumar-slide-thumb ${index === currentIndex ? "sumar-slide-thumb-active" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Ir a slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
                onClick={() => selectSlide(index)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") {
                    return;
                  }

                  event.preventDefault();
                  selectSlide(index);
                }}
              >
                <div className="sumar-slide-thumb-stage" aria-hidden>
                  <div className="sumar-slide sumar-slide-thumb-canvas">
                    <div className="sumar-slide-content">{slide}</div>
                  </div>
                </div>
                <span className="sumar-slide-thumb-index">{index + 1}</span>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <>
          <div className="sumar-carousel-frame">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentIndex}
                className="sumar-slide sumar-slide-carousel"
                initial={{ opacity: 0, y: 16, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.995 }}
                transition={{ duration: 0.34, ease: premiumEase }}
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

            <span className="sumar-carousel-divider" aria-hidden />

            <button
              type="button"
              className="sumar-carousel-button sumar-carousel-button-ghost"
              onClick={() => setIsGridView(true)}
              aria-label="Ver todas las slides"
            >
              <HugeiconsIcon icon={GridViewIcon} size={16} color="currentColor" strokeWidth={2} />
            </button>

            <button
              type="button"
              className="sumar-carousel-button sumar-carousel-button-ghost"
              onClick={() => {
                void toggleFullscreen();
              }}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
              disabled={!canUseFullscreen}
            >
              <HugeiconsIcon
                icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon}
                size={16}
                color="currentColor"
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="sumar-carousel-progress-track" aria-hidden>
            <motion.div
              className="sumar-carousel-progress-fill"
              animate={{ width: progressWidth }}
              transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.45 }}
            />
          </div>
        </>
      )}
      <div className="sr-only" aria-live="polite">
        Slide {currentIndex + 1} de {totalSlides}
      </div>
    </div>
  );
}
