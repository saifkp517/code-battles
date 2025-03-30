'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Code, Trophy, Users, Zap, Github, Linkedin, Twitter, ArrowRight } from 'lucide-react';

export default function WaitlistLandingPage() {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(437);
  const [remainingSpots, setRemainingSpots] = useState(100);

  // Simulate increasing waitlist count
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitlistCount(prev => prev + Math.floor(Math.random() * 3));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Form validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsValidEmail(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setIsSubmitted(true);
      setWaitlistCount(prev => prev + 1);
      setRemainingSpots(prev => Math.max(0, prev - 1));
    } else {
      setIsValidEmail(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Animated background with grid effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,56,202,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,transparent_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
            CodeBattle.io
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-gray-900 transition-all"
          >
            Login
          </motion.button>
        </nav>

        {/* Hero Section */}
        <motion.section 
          className="py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="w-full md:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              🚀 Compete. Code. Conquer.
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
                Join the Ultimate Coding Battle Arena!
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Turn coding practice into an adrenaline-fueled competition & prepare for your dream job while having fun.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 group transition-all"
              onClick={() => document.getElementById('signup').scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Waitlist
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 shadow-xl shadow-indigo-900/20">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-purple-900/80"></div>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">LIVE Coding Battle</div>
                    <div className="flex justify-center space-x-8 mb-4">
                      <div className="text-center">
                        <div className="text-purple-400 font-mono">Player 1</div>
                        <div className="text-xl font-bold">AlgoNinja</div>
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm mt-1">Typing...</div>
                      </div>
                      <div className="text-4xl font-bold text-pink-500">VS</div>
                      <div className="text-center">
                        <div className="text-cyan-400 font-mono">Player 2</div>
                        <div className="text-xl font-bold">CodeWizard</div>
                        <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm mt-1">Debugging</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-900/70 p-3 text-left font-mono text-sm overflow-hidden">
                      <pre className="text-green-400">function findOptimal(arr) {'{'}</pre>
                      <pre className="text-pink-300">  let max = -Infinity;</pre>
                      <pre className="text-pink-300">  let current = 0;</pre>
                      <pre className="text-pink-300">  </pre>
                      <pre className="text-pink-300">  for (let i = 0; i {'<'} arr.length; i++) {'{'}</pre>
                      <pre className="text-cyan-300">    current = Math.max(arr[i], current + arr[i]);</pre>
                      <pre className="text-cyan-300">    max = Math.max(max, current);</pre>
                      <pre className="text-pink-300">  {'}'}</pre>
                      <pre className="text-green-400">  return max;</pre>
                      <pre className="text-green-400">{'}'}</pre>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="mt-4 px-2 flex justify-between items-center">
                <div className="text-sm text-gray-400">Problem: Maximum Subarray</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-sm text-red-400">LIVE</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Join Us?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <motion.div 
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:bg-gray-800/50 transition-all"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-indigo-600/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">💡 Matched Competition</h3>
              <p className="text-gray-400">Get matched against coders at your skill level for fair, challenging battles.</p>
            </motion.div>
            
            {/* Benefit 2 */}
            <motion.div 
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:bg-gray-800/50 transition-all"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-purple-600/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">🔥 Real-time DSA Skills</h3>
              <p className="text-gray-400">Improve data structures and algorithms while battling in real-time scenarios.</p>
            </motion.div>
            
            {/* Benefit 3 */}
            <motion.div 
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:bg-gray-800/50 transition-all"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-pink-600/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">🏆 Recognition & Perks</h3>
              <p className="text-gray-400">Earn leaderboard recognition and exclusive rewards as you climb the ranks.</p>
            </motion.div>
            
            {/* Benefit 4 */}
            <motion.div 
              className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:bg-gray-800/50 transition-all"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="bg-cyan-600/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">🎓 Placement Preparation</h3>
              <p className="text-gray-400">Prepare for tech interviews and placements in a fun, engaging environment.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials/Social Proof Section
        <motion.section 
          className="py-16" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            What <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Students Say</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Join {waitlistCount}+ students who are already excited about our platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            Testimonial 1
            <motion.div 
              className="bg-gray-800/20 backdrop-blur-md border border-gray-700/50 p-6 rounded-xl hover:shadow-lg hover:shadow-purple-900/10 transition-all"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-bold">Ananya Singh</h4>
                  <p className="text-gray-400 text-sm">CS student, IIIT Delhi</p>
                </div>
              </div>
              <p className="text-gray-300">"This platform made coding exciting for me! The competitive element pushed me to improve my skills faster than traditional practice."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>

            Testimonial 2
            <motion.div 
              className="bg-gray-800/20 backdrop-blur-md border border-gray-700/50 p-6 rounded-xl hover:shadow-lg hover:shadow-purple-900/10 transition-all"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center text-xl font-bold mr-4">
                  R
                </div>
                <div>
                  <h4 className="font-bold">Rahul Mehta</h4>
                  <p className="text-gray-400 text-sm">B.Tech, IIT Bombay</p>
                </div>
              </div>
              <p className="text-gray-300">"I landed my dream job at Google after practicing on this platform. The real-time battles prepared me perfectly for technical interviews!"</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>

            Testimonial 3
            <motion.div 
              className="bg-gray-800/20 backdrop-blur-md border border-gray-700/50 p-6 rounded-xl hover:shadow-lg hover:shadow-purple-900/10 transition-all"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-xl font-bold mr-4">
                  P
                </div>
                <div>
                  <h4 className="font-bold">Priya Desai</h4>
                  <p className="text-gray-400 text-sm">MCA, NIT Trichy</p>
                </div>
              </div>
              <p className="text-gray-300">"The gamified approach to DSA practice is genius! I've improved my problem-solving speed by 40% in just two months of regular battles."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section> */}

        {/* Email Capture & Countdown Section */}
        <motion.section 
          id="signup"
          className="py-16" 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 md:p-12 border border-indigo-800/30 backdrop-blur-sm max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Get Early Access</span>
            </h2>
            
            {!isSubmitted ? (
              <>
                <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
                  ⏳ Early sign-ups get EXCLUSIVE rewards and premium features for FREE!
                </p>
                
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={`w-full px-4 py-3 rounded-lg bg-gray-800/70 border ${isValidEmail ? 'border-gray-700' : 'border-red-500'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                        required
                      />
                      {!isValidEmail && (
                        <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-purple-600/20 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      🔔 Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
                
                <div className="max-w-lg mx-auto">
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                    <span>0</span>
                    <span>Spots filling fast! Only {remainingSpots} left</span>
                    <span>100</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${100 - remainingSpots}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
                <p className="text-gray-300 mb-6">We'll notify you when we're ready to launch. Get ready for an exciting coding journey!</p>
                <p className="text-purple-400 font-medium">Share with your friends to move up the waitlist!</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-600/30 transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 hover:bg-indigo-600/30 transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Footer Section */}
        <footer className="py-12 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                CodeBattle.io
              </h3>
              <p className="text-gray-400 mb-4">
                Join our coding warriors & start your journey to becoming a top-tier programmer!
              </p>
              <div className="flex space-x-4">
                <motion.a 
                  whileHover={{ y: -3 }}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/30 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  whileHover={{ y: -3 }}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/30 transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  whileHover={{ y: -3 }}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/30 transition-all"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Join Discord</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: hello@codebattle.io</li>
                <li className="text-gray-400">Discord: codebattle.io/discord</li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} CodeBattle.io. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}