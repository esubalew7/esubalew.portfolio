import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import api from '../utils/api';
import { useContentStore } from '../store/contentStore';

// ─── Form field ────────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, error, multiline = false }) {
  const [focused, setFocused] = useState(false);

  const base = {
    display: 'block', width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${error ? 'var(--orange)' : focused ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
    padding: '12px 0',
    color: 'var(--text-primary)',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 15,
    outline: 'none',
    resize: 'none',
    transition: 'border-color 0.2s',
    minHeight: multiline ? 100 : 'auto',
  };

  return (
    <div style={{ marginBottom: 36 }}>
      <label
        style={{
          display: 'block',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: focused ? 'var(--text-secondary)' : 'var(--text-muted)',
          marginBottom: 8, transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={4}
          style={base}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
      {error && (
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--orange)', marginTop: 6, letterSpacing: '0.06em' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Contact link ──────────────────────────────────────────────────────────
function ContactLink({ icon, label, value, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid var(--border-faint)' }}
      onMouseEnter={e => { e.currentTarget.style.borderBottomColor = 'var(--orange)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderBottomColor = 'var(--border-faint)'; }}
    >
      <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
          {value}
        </p>
      </div>
      <svg style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </a>
  );
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────
export const ContactSection = () => {
  const { content } = useContentStore();
  const { contactInfo } = content || {};
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const [form, setForm]         = useState({ name: '', email: '', message: '' });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]     = useState(null); // 'success' | 'error'

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.email.trim())   e.email   = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Required';
    else if (form.message.trim().length < 10) e.message = 'Too short (min 10 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/api/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ background: 'var(--ink)', paddingTop: 'clamp(5rem,10vw,9rem)', paddingBottom: 'clamp(5rem,10vw,9rem)' }}
    >
      <div className="container-main">
        {/* Eyebrow */}
        <div className="section-eyebrow">Contact</div>

        {/* 2-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,360px),1fr))',
            gap: 'clamp(3rem,6vw,8rem)',
            alignItems: 'start',
          }}
        >
          {/* LEFT — intent statement */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
              className="font-display text-h2"
              style={{ color: 'var(--text-primary)', marginBottom: 24 }}
            >
              Let's build<br />
              <span style={{ color: 'var(--orange)' }}>something</span><br />
              <span style={{ color: 'var(--text-secondary)' }}>serious.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16,1,0.3,1] }}
              className="text-body-lg"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '3rem' }}
            >
              Whether it's a new system, a freelance engagement, or a full-time engineering role — 
              I respond to every message within 24 hours.
            </motion.p>

            {/* Contact links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <ContactLink
                icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                label="Email"
                value={contactInfo?.email || 'esubalew@example.com'}
                href={`mailto:${contactInfo?.email || 'esubalew@example.com'}`}
              />
              <ContactLink
                icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
                label="Location"
                value={contactInfo?.location || 'Ethiopia'}
                href="#"
              />
              {contactInfo?.phone && (
                <ContactLink
                  icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>}
                  label="Phone"
                  value={contactInfo.phone}
                  href={`tel:${contactInfo.phone}`}
                />
              )}
            </motion.div>
          </div>

          {/* RIGHT — form */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16,1,0.3,1] }}
          >
            {status === 'success' ? (
              <div
                style={{
                  padding: '3rem', border: '1px solid rgba(255,77,0,0.2)',
                  borderRadius: 4, background: 'var(--orange-dim)', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
                <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Message received.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  I'll reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <Field label="Your Name"    name="name"    value={form.name}    onChange={handleChange} error={errors.name} />
                <Field label="Email"        name="email"   value={form.email}   onChange={handleChange} error={errors.email} type="email" />
                <Field label="Message"      name="message" value={form.message} onChange={handleChange} error={errors.message} multiline />

                {status === 'error' && (
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--orange)', marginBottom: 20, letterSpacing: '0.06em' }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 12,
                    padding: '14px 32px',
                    background: submitting ? 'var(--border-subtle)' : 'var(--orange)',
                    color: submitting ? 'var(--text-muted)' : '#fff',
                    border: 'none', borderRadius: 3, cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.boxShadow = '0 0 32px var(--orange-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {submitting ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
