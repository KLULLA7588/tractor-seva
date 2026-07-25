import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { api } from '../../lib/api-client';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { customer_name: '', phone_number: '', email_address: '', message: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Same public endpoint InquiryForm already uses — submissions land
      // directly in the existing Admin > Inquiries list. part_id/part_name/
      // part_no are omitted since this is a general contact inquiry, not
      // tied to a specific part.
      await api.post('/inquiries', {
        part_id: null,
        part_name: null,
        part_no: null,
        customer_name: data.customer_name,
        phone_number: data.phone_number,
        email_address: data.email_address,
        message: data.message,
      });
      toast.success('Message sent successfully!');
      reset();
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1">
        <section className="w-full bg-bg-light py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
              Get In Touch
            </p>
            <h1 className="mt-2 text-center font-oswald text-2xl font-bold text-text-black md:mt-3 md:text-3xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-gray md:text-base">
              Have a question about a part, an order, or anything else? Send us
              a message and our team will get back to you.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-10">
              {/* Contact info */}
              <div className="md:col-span-2">
                <div className="rounded-lg border border-border-subtle bg-white p-6 shadow-card">
                  <h2 className="font-oswald text-lg font-semibold text-brand-navy">
                    Contact Information
                  </h2>
                  <ul className="mt-5 space-y-4">
                    <li className="flex items-start gap-3 text-sm text-text-gray">
                      <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-navy/50" strokeWidth={1.5} />
                      <span>+91 98765 43210</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-text-gray">
                      <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-navy/50" strokeWidth={1.5} />
                      <span>parts@tractorseva.com</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-text-gray">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-navy/50" strokeWidth={1.5} />
                      <span>Industrial Area, Phase II<br />Chandigarh, India</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-text-gray">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-navy/50" strokeWidth={1.5} />
                      <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-3">
                <div className="rounded-lg border border-border-subtle bg-white p-6 shadow-card md:p-8">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy-light/15">
                        <CheckCircle2 className="h-7 w-7 text-brand-navy" strokeWidth={1.5} />
                      </div>
                      <h3 className="mt-4 font-oswald text-lg font-semibold text-brand-navy">
                        Thanks for reaching out!
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-text-gray">
                        We've received your message and will get back to you soon.
                      </p>
                      <div className="mt-6 flex gap-3">
                        <Button variant="outline" onClick={() => setSubmitted(false)}>
                          Send Another
                        </Button>
                        <Link to="/catalog">
                          <Button>Browse Catalog</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-brand-navy">
                          Name <span className="text-brand-red">*</span>
                        </label>
                        <Input
                          {...register('customer_name', { required: 'Name is required' })}
                          placeholder="Your full name"
                          error={errors.customer_name?.message}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-brand-navy">Phone</label>
                          <Input
                            {...register('phone_number', {
                              pattern: { value: /^[0-9+\-\s]{10,15}$/, message: 'Enter a valid phone number' },
                            })}
                            placeholder="9876543210"
                            error={errors.phone_number?.message}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-brand-navy">
                            Email <span className="text-brand-red">*</span>
                          </label>
                          <Input
                            type="email"
                            {...register('email_address', {
                              required: 'Email is required',
                              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                            })}
                            placeholder="you@example.com"
                            error={errors.email_address?.message}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-brand-navy">Message</label>
                        <textarea
                          {...register('message')}
                          placeholder="How can we help you?"
                          rows={5}
                          className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-sm text-text-black placeholder:text-text-gray/60 focus:outline-none focus:shadow-input-focus focus:border-brand-navy"
                        />
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                        <Send className="h-4 w-4" />
                        {submitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}