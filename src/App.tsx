import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Breadcrumbs } from './components/common/Breadcrumbs';
import { HomeView } from './components/student/HomeView';
import { SubjectDetailView } from './components/student/SubjectDetailView';
import { UnitHubView } from './components/student/UnitHubView';
import { FacultyPortal } from './components/faculty/FacultyPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { TermsPage } from './components/legal/TermsPage';
import { api } from './services/api';
import {
  Course,
  Subject,
  Unit,
  TheoryQuestion,
  Numerical,
  MCQ,
  FacultyProfile,
  BreadcrumbItem,
} from './types';

export function App() {
  // Navigation states with direct URL support for /terms
  const getInitialView = (): 'home' | 'subject' | 'unit' | 'faculty' | 'admin' | 'terms' => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/terms' || window.location.hash === '#terms') {
        return 'terms';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<'home' | 'subject' | 'unit' | 'faculty' | 'admin' | 'terms'>(getInitialView);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [targetEvaluationQuestionId, setTargetEvaluationQuestionId] = useState<string | null>(null);

  // Loaded academic data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<TheoryQuestion[]>([]);
  const [numericals, setNumericals] = useState<Numerical[]>([]);
  const [mcqs, setMCQs] = useState<MCQ[]>([]);

  // User session
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load
  useEffect(() => {
    async function initApp() {
      setLoading(true);
      try {
        const [cList, sList, fProf, adminCheck] = await Promise.all([
          api.getCourses(),
          api.getSubjects(),
          api.getFacultyProfile(),
          api.checkIsAdmin(),
        ]);
        setCourses(cList);
        setSubjects(sList);
        setFacultyProfile(fProf);
        setIsAdmin(adminCheck);
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  // Browser navigation popstate listener for /terms
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        if (window.location.pathname === '/terms' || window.location.hash === '#terms') {
          setCurrentView('terms');
        } else {
          setCurrentView('home');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle subject selection
  const handleSelectSubject = async (subject: Subject) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
      window.history.pushState(null, '', '/');
    }
    setSelectedSubject(subject);
    const course = courses.find(c => c.id === subject.course_id) || null;
    setSelectedCourse(course);

    const uList = await api.getUnits(subject.id);
    setUnits(uList);
    setCurrentView('subject');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle unit selection (Enter Unit Hub)
  const handleSelectUnit = async (unit: Unit) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
      window.history.pushState(null, '', '/');
    }
    setSelectedUnit(unit);
    const [tList, nList, mList] = await Promise.all([
      api.getTheoryQuestions(unit.id),
      api.getNumericals(unit.id),
      api.getMCQs(unit.id),
    ]);
    setTheoryQuestions(tList);
    setNumericals(nList);
    setMCQs(mList);
    setCurrentView('unit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('home');
    setSelectedUnit(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTerms = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/terms') {
      window.history.pushState(null, '', '/terms');
    }
    setCurrentView('terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFacultyEvaluation = (questionId: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
      window.history.pushState(null, '', '/');
    }
    setTargetEvaluationQuestionId(questionId);
    setCurrentView('faculty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [];
  if (selectedCourse && currentView !== 'home') {
    breadcrumbItems.push({
      label: selectedCourse.code,
      onClick: () => {
        setCurrentView('home');
        setSelectedSubject(null);
        setSelectedUnit(null);
      },
    });
  }
  if (selectedSubject && (currentView === 'subject' || currentView === 'unit')) {
    breadcrumbItems.push({
      label: selectedSubject.name,
      onClick: () => {
        setCurrentView('subject');
        setSelectedUnit(null);
      },
    });
  }
  if (selectedUnit && currentView === 'unit') {
    breadcrumbItems.push({
      label: selectedUnit.title,
    });
  }
  if (currentView === 'faculty') {
    breadcrumbItems.push({
      label: 'Faculty Evaluation Portal',
    });
  }
  if (currentView === 'admin') {
    breadcrumbItems.push({
      label: 'Admin Control Center',
    });
  }
  if (currentView === 'terms') {
    breadcrumbItems.push({
      label: 'Terms & Conditions',
    });
  }

  const currentRole = currentView === 'admin' ? 'admin' : currentView === 'faculty' ? 'faculty' : 'student';

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onFacultyClick={() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
            window.history.pushState(null, '', '/');
          }
          setCurrentView('faculty');
        }}
        onAdminClick={() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
            window.history.pushState(null, '', '/');
          }
          setCurrentView('admin');
        }}
        onHomeClick={handleNavigateHome}
        facultyProfile={facultyProfile}
        isAdmin={isAdmin}
        currentRole={currentRole}
      />

      {/* Main container with left sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigateHome={handleNavigateHome}
          onNavigateFaculty={() => {
            if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
              window.history.pushState(null, '', '/');
            }
            setCurrentView('faculty');
          }}
          onNavigateAdmin={() => {
            if (typeof window !== 'undefined' && window.location.pathname === '/terms') {
              window.history.pushState(null, '', '/');
            }
            setCurrentView('admin');
          }}
          isAdmin={isAdmin}
        />

        {/* Content Viewport */}
        <main className="flex-1 py-6 lg:px-6 max-w-full">
          {/* Breadcrumbs (shown except when on bare home) */}
          {currentView !== 'home' && (
            <div className="mb-4">
              <Breadcrumbs
                items={breadcrumbItems}
                onHomeClick={handleNavigateHome}
              />
            </div>
          )}

          {/* Views */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-syllabo-200 border-t-syllabo-900 rounded-full animate-spin" />
            </div>
          ) : currentView === 'home' ? (
            <HomeView
              courses={courses}
              subjects={subjects}
              onSelectSubject={handleSelectSubject}
              onSelectProgram={(course) => setSelectedCourse(course)}
            />
          ) : currentView === 'terms' ? (
            <TermsPage onBackToHome={handleNavigateHome} />
          ) : currentView === 'subject' && selectedSubject ? (
            <SubjectDetailView
              subject={selectedSubject}
              units={units}
              onSelectUnit={handleSelectUnit}
              onBack={handleNavigateHome}
            />
          ) : currentView === 'unit' && selectedUnit && selectedSubject ? (
            <UnitHubView
              unit={selectedUnit}
              subject={selectedSubject}
              theoryQuestions={theoryQuestions}
              numericals={numericals}
              mcqs={mcqs}
              onOpenFacultyEvaluation={handleOpenFacultyEvaluation}
              isFaculty={Boolean(facultyProfile)}
            />
          ) : currentView === 'faculty' ? (
            <FacultyPortal
              onBackToStudent={handleNavigateHome}
              targetQuestionId={targetEvaluationQuestionId}
            />
          ) : currentView === 'admin' ? (
            <AdminPortal
              onBackToStudent={handleNavigateHome}
            />
          ) : null}
        </main>
      </div>

      {/* Global Footer */}
      <Footer onTermsClick={handleNavigateTerms} />
    </div>
  );
}

export default App;
