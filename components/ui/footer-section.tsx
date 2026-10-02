"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"

export interface FooterSectionProps {
  brandName?: string;
  tagline?: string;
  onNavigate?: (panel: string) => void;
  onDoctorLogin?: () => void;
  onAdminLogin?: () => void;
  authenticatedDoctor?: any;
  authenticatedAdmin?: any;
}

function Footerdemo({
  brandName = "Aura Nexus Health Systems",
  tagline = "Join our medical bulletin for clinical updates, wellness advisories, and OPD scheduling.",
  onNavigate,
  onDoctorLogin,
  onAdminLogin,
  authenticatedDoctor,
  authenticatedAdmin,
}: FooterSectionProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const [email, setEmail] = React.useState("")
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) return
    setIsSubscribed(true)
  }

  return (
    <footer className="relative border-t border-blue-900/30 bg-[#030712] text-slate-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Newsletter / Stay Connected */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">Stay Connected</h2>
            <p className="mb-6 text-sm text-slate-400 leading-relaxed">
              {tagline}
            </p>
            {isSubscribed ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                ✓ Subscribed to medical dispatches ({email})
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pr-12 backdrop-blur-sm bg-slate-900/80 border-blue-900/40 text-white placeholder:text-slate-500 text-sm focus-visible:ring-blue-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-transform hover:scale-105 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </form>
            )}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <nav className="space-y-2.5 text-sm text-slate-400">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate("patient");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block text-left transition-colors hover:text-blue-400 cursor-pointer"
              >
                Patient OPD Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate("tracker");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block text-left transition-colors hover:text-blue-400 cursor-pointer"
              >
                Live Token Radar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDoctorLogin) {
                    onDoctorLogin();
                  } else if (onNavigate) {
                    onNavigate("doctor");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="block text-left transition-colors hover:text-blue-400 cursor-pointer"
              >
                {authenticatedDoctor ? `Doctor Desk (${authenticatedDoctor.name})` : "Doctor Consultation Portal"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onAdminLogin) {
                    onAdminLogin();
                  } else if (onNavigate) {
                    onNavigate("admin");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="block text-left transition-colors hover:text-blue-400 cursor-pointer"
              >
                {authenticatedAdmin ? `Admin Desk (${authenticatedAdmin.username})` : "Reception & Admin Desk"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("departments-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="block text-left transition-colors hover:text-blue-400 cursor-pointer"
              >
                Clinical Specialties
              </button>
            </nav>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic text-slate-400 leading-relaxed">
              <p className="text-white font-medium">Aura Nexus Medical Center</p>
              <p>Chamber Wing A &amp; B, Medical Boulevard</p>
              <p>Emergency Triage: +92 (042) 111-287-200</p>
              <p>Clinical Support: care@auranexus.med</p>
              <p className="text-xs text-slate-500 font-mono pt-1">24/7 Red Code Trauma Sync Active</p>
            </address>
          </div>

          {/* Column 4: Follow Us & Theme Toggle */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold text-white">Follow Us</h3>
            <div className="mb-6 flex space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 cursor-pointer">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 cursor-pointer">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 cursor-pointer">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-slate-900/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 cursor-pointer">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Sun className="h-4 w-4 text-slate-400" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon className="h-4 w-4 text-blue-400" />
              <Label htmlFor="dark-mode" className="text-xs text-slate-400 cursor-pointer">
                Dark Mode
              </Label>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-center md:flex-row">
          <p className="text-xs text-slate-400">
            © 2026 {brandName}. All rights reserved. Outpatient Clinical Telemetry.
          </p>
          <nav className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-blue-400">
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-blue-400">
              Terms of Service
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-blue-400">
              HIPAA &amp; Security
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-blue-400">
              Telemetry Status
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
export default Footerdemo
