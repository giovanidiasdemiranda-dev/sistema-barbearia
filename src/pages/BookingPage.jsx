import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import UnitsSection from '../components/landing/UnitsSection';
import TeamSection from '../components/landing/TeamSection';
import ReviewsSection from '../components/landing/ReviewsSection';
import Footer from '../components/landing/Footer';
import WhatsAppButton from '../components/ui/WhatsAppButton';


import ShopCard from '../components/booking/ShopCard';
import BarberCard from '../components/booking/BarberCard';
import ServiceCard from '../components/booking/ServiceCard';
import Calendar from '../components/booking/Calendar';
import TimeSlots from '../components/booking/TimeSlots';
import ClientForm from '../components/booking/ClientForm';
import BookingSuccess from '../components/booking/BookingSuccess';
import CancelBooking from '../components/booking/CancelBooking';
import LoadingMap from '../components/ui/LoadingMap';
import { shopsApi, barbersApi, servicesApi, appointmentsApi, formatDate } from '../lib/storage';
import { useToast } from '../components/ui/Toast';

const STEPS = [
  { id: 1, label: 'Unidade' },
  { id: 2, label: 'Barbeiro' },
  { id: 3, label: 'Serviço' },
  { id: 4, label: 'Data e Hora' },
  { id: 5, label: 'Confirmação' },
];

export default function BookingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('landing'); // 'landing', 'booking_loading', 'booking', 'cancel', 'success'
  const [initialPresets, setInitialPresets] = useState({});

  const handleOpenBooking = (presets = {}) => {
    setInitialPresets(presets);
    setView('booking_loading');
    setIsModalOpen(true);
    // Simulate loading map
    setTimeout(() => {
      setView('booking');
    }, 1800);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setView('landing');
      setInitialPresets({});
    }, 300); // Wait for transition
  };

  return (
    <div className="min-h-dvh bg-dark-950 font-sans bg-gradient-to-b from-brand-red/10 via-brand-blue/10 to-brand-yellow/10 relative overflow-x-hidden text-neutral-50 scroll-smooth">
      {/* ─── COLOMBIA TRICOLOR TOP ACCENT BAR ────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 flex pointer-events-none shadow-[0_2px_15px_rgba(252,209,22,0.3)]">
        <div className="w-1/2 bg-brand-yellow" />
        <div className="w-1/4 bg-brand-blue" />
        <div className="w-1/4 bg-brand-red" />
      </div>

      {/* ─── NAVBAR ──────────────────────────────────────────────── */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      {/* ─── INTERCALATED COLOMBIAN ATMOSPHERE GLOWS ────────────── */}


      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Barbearia Background"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/70 to-dark-950" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center md:items-start text-center md:text-left">
          
          {/* Working Hours Badge — Inspired by Behance */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow text-xs sm:text-sm font-bold tracking-wider mb-6 animate-fade-in shadow-[0_0_20px_rgba(252,209,22,0.15)]">
            <span>🕒</span> Horário de funcionamento: 09h00 às 20h00
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-tight mb-6" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <span className="inline-block animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>Agende</span>
            <br />
            <span className="inline-block animate-slide-up opacity-0 text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow" style={{ animationDelay: '300ms' }}>
              Seu
            </span>{' '}
            <span className="inline-block animate-slide-up opacity-0 text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow" style={{ animationDelay: '500ms' }}>
              Horário
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10 animate-slide-up leading-relaxed"
            style={{ animationDelay: '300ms' }}
          >
            A verdadeira experiência latina em cuidados masculinos. Escolha sua unidade, seu barbeiro e agende seu horário em segundos sem precisar criar conta.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => handleOpenBooking()}
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-brand-yellow text-dark-950 font-black text-lg uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(252,209,22,0.4)] hover:shadow-[0_0_60px_rgba(252,209,22,0.6)] btn-press"
            >
              <span className="relative z-10 flex items-center gap-3">
                Agendar Agora
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>

            <a
              href="#servicos"
              className="inline-flex items-center justify-center px-8 py-5 rounded-2xl border border-white/15 bg-dark-900/60 hover:bg-dark-800 text-neutral-200 font-bold text-base transition-all hover:border-white/30"
            >
              Ver Serviços & Preços
            </a>
          </div>

          {/* Quick Units and Appointment Status Pills */}
          <div
            className="mt-14 pt-8 border-t border-white/10 animate-fade-in flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-semibold"
            style={{ animationDelay: '600ms' }}
          >
            <a
              href="#unidades"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow shadow-[0_0_15px_rgba(252,209,22,0.15)] hover:bg-brand-yellow/20 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-brand-yellow" />
              <MapPinIcon /> Sede Costa e Silva
            </a>
            <a
              href="#unidades"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-blue/40 bg-brand-blue/20 text-blue-300 shadow-[0_0_15px_rgba(0,56,147,0.2)] hover:bg-brand-blue/30 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              <MapPinIcon /> Sede Mario Quintana
            </a>
            <button
              onClick={() => {
                setView('cancel');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-red/30 bg-brand-red/10 text-red-300 hover:bg-brand-red/20 transition-all shadow-[0_0_15px_rgba(206,17,38,0.15)] btn-press"
            >
              <span className="w-2 h-2 rounded-full bg-brand-red" />
              Ver meus agendamentos
            </button>
          </div>

        </div>
      </section>

      {/* ─── ABOUT SECTION (Tradição Latina) ─────────────────────── */}
      <AboutSection />

      {/* ─── SERVICES & PRICING MENU ─────────────────────────────── */}
      <ServicesSection
        onBookService={(svc) => handleOpenBooking({ service: svc })}
      />

      {/* ─── UNITS SECTION (Behance Cards) ───────────────────────── */}
      <UnitsSection
        onBookShop={(shop) => handleOpenBooking({ shop })}
      />

      {/* ─── MASTER BARBERS TEAM ─────────────────────────────────── */}
      <TeamSection
        onBookBarber={(barber) => handleOpenBooking({ barber })}
      />

      {/* ─── REVIEWS / SOCIAL PROOF ──────────────────────────────── */}
      <ReviewsSection />

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* ─── FLOATING WHATSAPP BUTTON ────────────────────────────── */}
      <WhatsAppButton />

      {/* ─── BOOKING MODAL OVERLAY (Glassmorphism) ────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-dark-950/75 backdrop-blur-xl animate-fade-in"
            onClick={handleCloseModal}
          />

          <div className="relative w-full max-w-2xl bg-dark-900 border-t sm:border border-dark-600/50 rounded-t-[2rem] sm:rounded-3xl shadow-2xl h-[90dvh] sm:h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header with Colombia Accent Micro-Line */}
            <div className="relative shrink-0 flex items-center justify-between px-6 py-4 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md z-10">
              <div className="absolute top-0 left-0 right-0 h-1 flex">
                <div className="w-1/2 bg-brand-yellow" />
                <div className="w-1/4 bg-brand-blue" />
                <div className="w-1/4 bg-brand-red" />
              </div>
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-800 text-neutral-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
              {view === 'booking_loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-900">
                  <LoadingMap />
                </div>
              )}
              {view === 'booking' && (
                <BookingFlow
                  presets={initialPresets}
                  onClose={handleCloseModal}
                />
              )}
              {view === 'cancel' && (
                <div className="p-6 h-full flex flex-col">
                  <CancelBooking onBack={handleCloseModal} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOOKING FLOW (Stepper Component) ────────────────────────────
function BookingFlow({ onClose, presets = {} }) {
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

  const [selectedShop, setSelectedShop] = useState(presets.shop || null);
  const [selectedBarber, setSelectedBarber] = useState(presets.barber || null);
  const [selectedService, setSelectedService] = useState(presets.service || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [completedAppointment, setCompletedAppointment] = useState(null);

  useEffect(() => {
    const allShops = shopsApi.getActive();
    const allServices = servicesApi.getActive();
    setShops(allShops);
    setServices(allServices);

    if (presets.barber) {
      const foundShop = allShops.find((s) => s.id === presets.barber.shop_id);
      if (foundShop) {
        setSelectedShop(foundShop);
        setBarbers(barbersApi.getByShop(foundShop.id));
      }
      setSelectedBarber(presets.barber);
      setStep(presets.service ? 4 : 3);
    } else if (presets.shop) {
      setSelectedShop(presets.shop);
      setBarbers(barbersApi.getByShop(presets.shop.id));
      setStep(presets.service ? 3 : 2);
    } else if (presets.service) {
      setSelectedService(presets.service);
      setStep(1);
    }
  }, []);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setBarbers(barbersApi.getByShop(shop.id));
    if (!selectedBarber || selectedBarber.shop_id !== shop.id) {
      setSelectedBarber(null);
    }
    setTimeout(() => {
      setStep(selectedService ? 4 : 2);
    }, 250);
  };

  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setTimeout(() => {
      setStep(selectedService ? 4 : 3);
    }, 250);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setTimeout(() => setStep(4), 250);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setTimeout(() => setStep(5), 200);
  };

  const handleConfirm = async ({ name, phone }) => {
    try {
      const [h, m] = selectedTime.split(':').map(Number);
      const endMinutes = h * 60 + m + selectedService.duration_minutes;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      const appointment = appointmentsApi.create({
        shop_id: selectedShop.id,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        client_name: name,
        client_phone: phone,
        date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
      });
      setCompletedAppointment(appointment);
      setStep(6); // 6 = success
    } catch {
      addToast('Erro ao criar agendamento.', 'error');
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  if (step === 6) {
    return (
      <div className="page-enter p-6">
        <BookingSuccess
          appointment={completedAppointment}
          barber={selectedBarber}
          service={selectedService}
          onNewBooking={onClose}
        />
      </div>
    );
  }

  const stepTitles = {
    1: 'Escolha a Unidade',
    2: 'Escolha seu Profissional',
    3: 'Qual serviço deseja?',
    4: 'Data e Horário',
    5: 'Confirmação',
  };

  return (
    <div className="p-6 pb-20">
      {/* Stepper Header */}
      <div className="mb-8 relative">
        {step > 1 && (
          <button
            onClick={goBack}
            aria-label="Voltar"
            className="absolute -left-2 top-0 w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-50 bg-dark-800 transition-all btn-press z-10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            {STEPS.map((s, idx) => {
              const stepColors = [
                'bg-brand-yellow shadow-[0_0_10px_rgba(252,209,22,0.6)]',
                'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]',
                'bg-brand-red shadow-[0_0_10px_rgba(206,17,38,0.6)]',
                'bg-brand-yellow shadow-[0_0_10px_rgba(252,209,22,0.6)]',
                'bg-gradient-to-r from-brand-yellow via-blue-500 to-brand-red',
              ];
              const isCurrent = step === s.id;
              const isPast = step > s.id;
              return (
                <div
                  key={s.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? `${stepColors[idx]} w-8`
                      : isPast
                      ? 'bg-neutral-500 w-2.5'
                      : 'bg-dark-600 w-2'
                  }`}
                />
              );
            })}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider animate-slide-up" key={`title-${step}`}>
            {stepTitles[step]}
          </h2>
          {step === 4 && selectedDate && (
            <p className="text-brand-yellow font-medium mt-1 animate-fade-in">{formatDate(selectedDate)}</p>
          )}
        </div>
      </div>

      {/* Stepper Content */}
      <div className="relative">
        <div key={`step-${step}`} className="animate-slide-up" style={{ animationDuration: '400ms' }}>
          {step === 1 && (
            <div className="space-y-4">
              {shops.map((shop, i) => (
                <div className="animate-stagger-item" style={{ animationDelay: `${i * 100}ms` }} key={shop.id}>
                  <ShopCard shop={shop} selected={selectedShop?.id === shop.id} onSelect={handleSelectShop} />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {barbers.length === 0 ? (
                <p className="text-center text-neutral-500 py-10">Nenhum barbeiro disponível nesta unidade.</p>
              ) : (
                barbers.map((barber, i) => (
                  <div className="animate-stagger-item" style={{ animationDelay: `${i * 100}ms` }} key={barber.id}>
                    <BarberCard barber={barber} selected={selectedBarber?.id === barber.id} onSelect={handleSelectBarber} />
                  </div>
                ))
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {services.map((service, i) => (
                <div className="animate-stagger-item" style={{ animationDelay: `${i * 80}ms` }} key={service.id}>
                  <ServiceCard service={service} selected={selectedService?.id === service.id} onSelect={handleSelectService} />
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="bg-dark-900/50 rounded-2xl border border-dark-600/50 p-4 shadow-inner-glow">
              <Calendar barberId={selectedBarber?.id} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-dark-600/50 animate-fade-in">
                  <TimeSlots barberId={selectedBarber?.id} date={selectedDate} durationMinutes={selectedService?.duration_minutes} selectedTime={selectedTime} onSelectTime={handleSelectTime} />
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <ClientForm
                booking={{ shop: selectedShop, barber: selectedBarber, service: selectedService, date: selectedDate, time: selectedTime }}
                onConfirm={handleConfirm}
                onBack={goBack}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
