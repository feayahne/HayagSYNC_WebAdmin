import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  INITIAL_STUDENTS,
  INITIAL_INCIDENTS,
  INITIAL_APPEALS,
  INITIAL_COMMUNITY_SERVICES,
  INITIAL_EXPULSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  SETTINGS_CONFIG,
} from '../data/initialSeedData';
import { useAuth } from './AuthContext';

// Helper to compute automatic grade-level assignments
export const determineGradeAssignments = (studentGrade, studentSection, bullyGradeSection) => {
  const grades = [];
  for (const text of [studentGrade || '', studentSection || '', bullyGradeSection || '']) {
    const match = text.match(/Grade\s*(\d+)/i);
    if (match) {
      const g = `Grade ${match[1]}`;
      if (!grades.includes(g)) grades.push(g);
    }
  }
  if (grades.length === 0) grades.push('Grade 7');

  const ministroMap = {
    'Grade 7': 'Gng. Corazon Alcantara (ministro.grade7@hayag.edu.ph)',
    'Grade 8': 'G. Arnel Bautista (ministro.grade8@hayag.edu.ph)',
    'Grade 9': 'Gng. Remedios Santos (ministro.grade9@hayag.edu.ph)',
    'Grade 10': 'G. Danilo Cruz (ministro.grade10@hayag.edu.ph)',
    'Grade 11': 'Gng. Jocelyn Reyes (ministro.grade11@hayag.edu.ph)',
    'Grade 12': 'G. Fernando Garcia (ministro.grade12@hayag.edu.ph)',
  };

  const osdMap = {
    'Grade 7': 'G. Renato Dalisay (osd.grade7@hayag.edu.ph)',
    'Grade 8': 'Gng. Teresa Mercado (osd.grade8@hayag.edu.ph)',
    'Grade 9': 'G. Victor Navarro (osd.grade9@hayag.edu.ph)',
    'Grade 10': 'Gng. Angela Pineda (osd.grade10@hayag.edu.ph)',
    'Grade 11': 'G. Marco Valenzuela (osd.grade11@hayag.edu.ph)',
    'Grade 12': 'Gng. Caridad Soriano (osd.grade12@hayag.edu.ph)',
  };

  const assignedMinistros = grades.map((g) => ministroMap[g] || ministroMap['Grade 7']);
  const assignedOsds = grades.map((g) => osdMap[g] || osdMap['Grade 7']);

  const assignedPrincipals = [];
  const hasJhs = grades.some((g) => ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(g));
  const hasShs = grades.some((g) => ['Grade 11', 'Grade 12'].includes(g));

  if (hasJhs) assignedPrincipals.push('Dr. Alicia Magalong - JHS Principal (principal.jhs@hayag.edu.ph)');
  if (hasShs) assignedPrincipals.push('Dr. Evelyn Morales - SHS Principal (principal.shs@hayag.edu.ph)');
  if (assignedPrincipals.length === 0) assignedPrincipals.push('Dr. Alicia Magalong - JHS Principal (principal.jhs@hayag.edu.ph)');

  return {
    grades,
    primaryGrade: grades[0],
    ministros: assignedMinistros,
    osds: assignedOsds,
    principals: assignedPrincipals,
    ministroName: assignedMinistros.join(' & '),
    osdName: assignedOsds.join(' & '),
    principalName: assignedPrincipals.join(' & '),
  };
};

const IncidentContext = createContext();

export const IncidentProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('hayagsync_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_STUDENTS.length) return parsed;
      } catch (_) {}
    }
    return INITIAL_STUDENTS;
  });

  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('hayagsync_incidents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_INCIDENTS.length) return parsed;
      } catch (_) {}
    }
    return INITIAL_INCIDENTS;
  });

  const [appeals, setAppeals] = useState(() => {
    const saved = localStorage.getItem('hayagsync_appeals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_APPEALS.length) return parsed;
      } catch (_) {}
    }
    return INITIAL_APPEALS;
  });

  const [communityServices, setCommunityServices] = useState(() => {
    const saved = localStorage.getItem('hayagsync_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_COMMUNITY_SERVICES.length) return parsed;
      } catch (_) {}
    }
    return INITIAL_COMMUNITY_SERVICES;
  });

  const [expulsions, setExpulsions] = useState(() => {
    const saved = localStorage.getItem('hayagsync_expulsions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_EXPULSIONS.length) return parsed;
      } catch (_) {}
    }
    return INITIAL_EXPULSIONS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('hayagsync_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hayagsync_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hayagsync_settings');
    return saved ? JSON.parse(saved) : SETTINGS_CONFIG;
  });

  // Save changes to localStorage for persistent experience
  useEffect(() => {
    localStorage.setItem('hayagsync_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hayagsync_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('hayagsync_appeals', JSON.stringify(appeals));
  }, [appeals]);

  useEffect(() => {
    localStorage.setItem('hayagsync_services', JSON.stringify(communityServices));
  }, [communityServices]);

  useEffect(() => {
    localStorage.setItem('hayagsync_expulsions', JSON.stringify(expulsions));
  }, [expulsions]);

  useEffect(() => {
    localStorage.setItem('hayagsync_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hayagsync_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hayagsync_settings', JSON.stringify(settings));
  }, [settings]);

  // Load real-time cloud data from Supabase
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data: repData, error: repErr } = await supabase
          .from('reports')
          .select('*')
          .order('id', { ascending: false });

        if (!repErr && repData && repData.length > 0) {
          const cloudIncidents = repData.map((r) => {
            const rawStatus = (r.status || 'Pending').toLowerCase();
            let uiStatus = r.status || 'Recent Report';
            if (rawStatus === 'pending') uiStatus = 'Recent Report';
            else if (rawStatus === 'resolved' || rawStatus.includes('finalized by school president')) uiStatus = 'Resolved';
            else if (rawStatus.includes('initial intervention') || rawStatus === 'under review' || rawStatus === 'scheduled_meeting') uiStatus = 'Forwarded for Initial Intervention';
            else if (rawStatus.includes('osd and principal')) uiStatus = 'Escalated to OSD and Principal';
            else if (rawStatus.includes('board of discipline') || rawStatus === 'referred to board of discipline') uiStatus = 'Escalated to Board of Discipline';
            else if (rawStatus.includes('school president') || rawStatus.includes('president review')) uiStatus = 'Forwarded to School President';
            else if (rawStatus === 'escalated to principal') uiStatus = 'Escalated to Principal';
            else if (rawStatus === 'escalated to ministrong tagasubaybay') uiStatus = 'Escalated to Ministrong Tagasubaybay';
            else if (rawStatus === 'escalated to osd') uiStatus = 'Escalated to OSD';
            else if (rawStatus === 'appealed') uiStatus = 'Appealed';
            else if (rawStatus === 'community service') uiStatus = 'Community Service';
            else if (rawStatus === 'expelled') uiStatus = 'Expelled';
            else if (rawStatus.includes('escalat')) uiStatus = r.status;

            let stageNumber = 1;
            let stageName = 'OSD Initial Assessment';
            let currentHandlingOffice = 'Office of Student Discipline';

            const hasPresidentAffirmation =
              (r.discipline_notes || '').toLowerCase().includes('president') ||
              (r.status || '').toLowerCase().includes('president');

            if (hasPresidentAffirmation) {
              stageNumber = 5;
              stageName = 'School President Final Review';
              currentHandlingOffice = 'Office of the School President';
            } else if (rawStatus.includes('initial intervention') || rawStatus.includes('ministrong') || rawStatus.includes('under review') || rawStatus.includes('scheduled')) {
              stageNumber = 2;
              stageName = 'Ministrong Tagasubaybay & Section Adviser';
              currentHandlingOffice = 'Ministrong Tagasubaybay & Adviser';
            } else if (rawStatus.includes('osd and principal') || rawStatus.includes('escalated to principal') || rawStatus.includes('escalated to osd') || (rawStatus.includes('escalat') && !rawStatus.includes('board'))) {
              stageNumber = 3;
              stageName = 'OSD & Principal Joint Intervention';
              currentHandlingOffice = 'Office of Student Discipline & Principal';
            } else if (rawStatus.includes('board of discipline') || rawStatus.includes('referred to board')) {
              stageNumber = 4;
              stageName = 'Board of Discipline Deliberation';
              currentHandlingOffice = 'Board of Discipline';
            }

            const isAnonymous = (r.report_source || '').toLowerCase() === 'anonymous' || r.parent_name === 'Anonymous Reporter';

            const isHighPriority = r.is_high_priority === true ||
              (r.urgency_level && (r.urgency_level.toLowerCase() === 'high' || r.urgency_level.toLowerCase() === 'critical')) ||
              (r.category && (r.category.toLowerCase().includes('physical') || r.category.toLowerCase().includes('severe')));

            let parsedWitnesses = [];
            if (Array.isArray(r.witnesses)) parsedWitnesses = r.witnesses;
            else if (typeof r.witnesses === 'string') {
              try { parsedWitnesses = JSON.parse(r.witnesses); } catch (_) { parsedWitnesses = [r.witnesses]; }
            }

            return {
              id: `rep_${r.id}`,
              numeric_id: r.id,
              case_number: `INC-${new Date(r.created_at || Date.now()).getFullYear()}-${String(r.id).padStart(3, '0')}`,
              student_name: r.student_name,
              student_grade: r.student_grade || '',
              student_section: r.student_section || '',
              student_lrn: r.student_id ? `LRN-2026-${r.student_id}` : '109283741001',
              title: r.title,
              category: r.category || 'General',
              description: r.description || '',
              incident_date: r.incident_date,
              incident_location: r.incident_location || 'Campus',
              status: uiStatus,
              severity: r.urgency_level || 'Moderate',
              is_high_priority: isHighPriority,
              evidence_url: r.evidence_url,
              evidence_verification_state: r.evidence_verification_state || 'Unverified',
              ai_summary: r.ai_summary,
              discipline_action: r.discipline_action,
              discipline_notes: r.discipline_notes,
              appealed_reason: r.appealed_reason,
              appeal_count: r.appeal_count || 0,
              bully_name: r.bully_name,
              bully_grade_section: r.bully_grade_section,
              witnesses: parsedWitnesses,
              is_anonymous: isAnonymous,
              report_source: r.report_source || (isAnonymous ? 'Anonymous' : 'Registered Parent'),
              stageNumber,
              stageName,
              currentHandlingOffice,
              board_findings: r.hearing_notes || r.board_recommendations || '',
              board_decision: r.board_decision || '',
              punishment_imposed: r.discipline_action || '',
              president_notes: (r.discipline_notes || '').replace(/^President Final Affirmation:\s*/i, ''),
              president_finalized: hasPresidentAffirmation,
              president_reviewed: hasPresidentAffirmation,
              escalation_reason: r.escalation_reason,
              escalation_notes: r.escalation_notes,
              escalated_to: r.escalated_to,
              hearing_notes: r.hearing_notes,
              board_recommendations: r.board_recommendations,
              board_referred: r.board_referred || uiStatus === 'Referred to Board of Discipline' || stageNumber >= 4,
              created_at: r.created_at,
              updated_at: r.updated_at,
              reporter_name: isAnonymous ? 'Anonymous Reporter' : (r.parent_name || 'Parent'),
              reporter_role: isAnonymous ? 'Anonymous' : 'Parent',
              status_history: [
                {
                  from_status: 'None',
                  to_status: uiStatus,
                  changed_by: isAnonymous ? 'Anonymous Reporter' : (r.parent_name || 'System'),
                  role: isAnonymous ? 'Anonymous' : 'Reporter',
                  remark: isAnonymous ? 'Anonymous report filed through platform.' : 'Cloud synced record from Supabase database.',
                  timestamp: r.created_at,
                }
              ]
            };
          });
          setIncidents(cloudIncidents);
        }

        const { data: stuData, error: stuErr } = await supabase
          .from('students')
          .select('*');

        if (!stuErr && stuData && stuData.length > 0) {
          const cloudStudents = stuData.map((s) => ({
            id: `stu_${s.id}`,
            numeric_id: s.id,
            name: s.name,
            grade: s.grade,
            section: s.section,
            academic_year: s.academic_year || '2026-2027',
            lrn: s.lrn || `10928374${String(s.id).padStart(4, '0')}`,
            parent_id: s.parent_id,
          }));
          setStudents(cloudStudents);
        }
      } catch (err) {
        console.warn('Failed to load from Supabase:', err);
      }
    };

    loadFromSupabase();

    // Supabase Real-time channel for instant sync across Web and Mobile
    const channel = supabase
      .channel('public:reports:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        loadFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Audit Logger ---
  const logAudit = (action, targetEntity, targetId, details) => {
    const newLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_name: currentUser?.name || 'Anonymous User',
      user_role: currentUser?.role || 'visitor',
      action,
      target_entity: targetEntity,
      target_id: targetId,
      details,
      ip_address: '192.168.1.' + Math.floor(Math.random() * 80 + 10),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // --- Create Incident ---
  const createIncident = async (data) => {
    let cloudId = null;
    try {
      const { data: inserted, error } = await supabase.from('reports').insert({
        student_name: data.student_name,
        student_grade: data.student_grade || '',
        student_section: data.student_section || '',
        title: data.title || `${data.category} report for ${data.student_name}`,
        category: data.category,
        description: data.description,
        incident_date: data.incident_date || new Date().toISOString(),
        incident_location: data.incident_location || 'Campus',
        status: 'Pending',
        parent_name: currentUser?.name || data.reporter_name || 'Admin',
      }).select().single();

      if (!error && inserted) {
        cloudId = inserted.id;
      }
    } catch (e) {
      console.warn('Could not insert report to Supabase:', e);
    }

    const nextNum = cloudId || (incidents.length + 1);
    const caseNum = `INC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newIncident = {
      id: cloudId ? `rep_${cloudId}` : `inc_${Date.now()}`,
      numeric_id: cloudId,
      case_number: caseNum,
      ...data,
      status: 'Recent Report',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [
        {
          from_status: 'None',
          to_status: 'Recent Report',
          changed_by: currentUser?.name || data.reporter_name || 'System',
          role: currentUser?.role || data.reporter_role || 'Reporter',
          remark: 'Initial report filed via Web Platform.',
          timestamp: new Date().toISOString(),
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // Add notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      role: 'all_admin',
      title: 'New Incident Report Filed',
      message: `Report ${caseNum} filed for ${data.student_name} (${data.category})`,
      type: 'report',
      is_read: false,
      timestamp: new Date().toISOString(),
      link: newIncident.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAudit('CREATE', 'Incident Report', caseNum, `Created incident for ${data.student_name}`);
    return newIncident;
  };

  // --- Create Anonymous Report (Zero identity logged, full protection) ---
  const createAnonymousReport = async (data) => {
    let cloudId = null;
    try {
      const { data: inserted, error } = await supabase.from('reports').insert({
        student_name: data.student_name || 'Unspecified Student',
        student_grade: data.student_grade || '',
        student_section: data.student_section || '',
        title: data.title || `${data.category || 'Incident'} Report (Anonymous)`,
        category: data.category || 'Bullying Incident',
        description: data.description || '',
        incident_date: data.incident_date || new Date().toISOString(),
        incident_location: data.incident_location || 'Campus',
        urgency_level: data.urgency_level || 'Moderate',
        bully_name: data.bully_name || null,
        bully_grade_section: data.bully_grade_section || null,
        witnesses: data.witnesses || null,
        evidence_url: data.evidence_url || null,
        status: 'Pending',
        report_source: 'Anonymous',
        parent_name: 'Anonymous Reporter',
      }).select().single();

      if (!error && inserted) {
        cloudId = inserted.id;
        await supabase.from('timeline_events').insert({
          report_id: cloudId,
          title: 'Anonymous Report Filed',
          description: 'Incident report submitted directly without account authentication. Identity protected under RA 10173.',
          actor_name: 'Anonymous Reporter',
          actor_role: 'Anonymous User',
        });
      }
    } catch (e) {
      console.warn('Could not insert anonymous report to Supabase:', e);
    }

    const nextNum = cloudId || (incidents.length + 1);
    const caseNum = `INC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newIncident = {
      id: cloudId ? `rep_${cloudId}` : `inc_${Date.now()}`,
      numeric_id: cloudId,
      case_number: caseNum,
      ...data,
      is_anonymous: true,
      report_source: 'Anonymous',
      reporter_name: 'Anonymous Reporter',
      reporter_role: 'Anonymous',
      status: 'Recent Report',
      stageNumber: 1,
      stageName: 'OSD Initial Assessment',
      currentHandlingOffice: 'Office of Student Discipline',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_history: [
        {
          from_status: 'None',
          to_status: 'Recent Report',
          changed_by: 'Anonymous Reporter',
          role: 'Anonymous',
          remark: 'Anonymous report submitted via Public Portal. Protected identity.',
          timestamp: new Date().toISOString(),
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);

    const newNotif = {
      id: `notif_${Date.now()}`,
      role: 'all_admin',
      title: 'New Anonymous Incident Report Filed',
      message: `Anonymous report ${caseNum} submitted (${data.category}) - Awaiting Stage 1 OSD assessment.`,
      type: 'report',
      is_read: false,
      timestamp: new Date().toISOString(),
      link: newIncident.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAudit('ANONYMOUS_REPORT_CREATE', 'Incident Report', caseNum, `New anonymous incident report filed`);
    return newIncident;
  };

  // --- Stage 1 -> Stage 2: Forward for Initial Intervention ---
  const forwardForInitialIntervention = async (incidentId, notes = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Forwarded for Initial Intervention';

    const inc = incidents.find((i) => i.id === incidentId || i.numeric_id === numId);
    const targetCaseNum = inc?.case_number || `Case #${rawId}`;
    const targetStudent = inc?.student_name || 'Student';
    const targetSection = inc?.student_section || inc?.section || 'Grade Section';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: newStatus,
          discipline_notes: notes || null,
          escalated_to: 'Ministrong Tagasubaybay & Section Adviser',
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Stage 1 Completed: Forwarded for Initial Intervention',
          description: notes ? `Assessment Notes: ${notes}` : 'OSD completed initial assessment and referred case for joint intervention.',
          actor_name: currentUser?.name || 'OSD Officer',
          actor_role: 'OSD',
        });
      } catch (e) {
        console.warn('Could not sync stage 1 forward to Supabase:', e);
      }
    }

    // Push instant notification to Section Adviser & Ministrong Tagasubaybay
    const newNotif = {
      id: `notif_${Date.now()}`,
      role: 'all_admin',
      title: 'Action Required: Forwarded for Initial Intervention',
      message: `${targetCaseNum} (${targetStudent} - ${targetSection}) has been forwarded by OSD to Ministrong Tagasubaybay & Section Adviser for Stage 2 Joint Intervention.`,
      type: 'intervention',
      is_read: false,
      timestamp: new Date().toISOString(),
      link: incidentId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return updateIncidentStatus(incidentId, newStatus, notes || 'Forwarded for Initial Intervention by OSD', {
      stageNumber: 2,
      stageName: 'Ministrong Tagasubaybay & Section Adviser',
      currentHandlingOffice: 'Ministrong Tagasubaybay & Adviser',
      escalated_to: 'Ministrong Tagasubaybay & Section Adviser',
    });
  };

  // --- Stage 2 -> Resolved: Resolve Initial Intervention ---
  const resolveInitialIntervention = async (incidentId, restorativeAction, notes = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Resolved';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: 'resolved',
          discipline_action: restorativeAction || 'Restorative Intervention Completed',
          discipline_notes: notes || null,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Case Resolved - Initial Intervention Successful',
          description: `Action: ${restorativeAction || 'Restorative Intervention'}. Notes: ${notes}`,
          actor_name: currentUser?.name || 'Authorized Official',
          actor_role: currentUser?.role || 'Staff',
        });
      } catch (e) {
        console.warn('Could not sync stage 2 resolution to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, notes || 'Case resolved at Stage 2 joint intervention.', {
      discipline_action: restorativeAction,
      discipline_notes: notes,
    });
  };

  // --- Stage 2 -> Stage 3: Escalate to OSD and Principal ---
  const escalateToOsdAndPrincipal = async (incidentId, reason, notes = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Escalated to OSD and Principal';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: newStatus,
          escalation_reason: reason,
          escalation_notes: notes || null,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Stage 2 Escalation: Escalated to OSD and Principal',
          description: `Reason: ${reason}. Notes: ${notes}`,
          actor_name: currentUser?.name || 'Assigned Staff',
          actor_role: currentUser?.role || 'Staff',
        });
      } catch (e) {
        console.warn('Could not sync stage 2 escalation to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, `Escalation Reason: ${reason}`, {
      stageNumber: 3,
      stageName: 'OSD & Principal Joint Intervention',
      currentHandlingOffice: 'Office of Student Discipline & Principal',
      escalation_reason: reason,
      escalation_notes: notes,
    });
  };

  // --- Stage 3 -> Resolved: Resolve Case with Disciplinary Action ---
  const resolveOsdAndPrincipal = async (incidentId, disciplineAction, notes = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Resolved';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: 'resolved',
          discipline_action: disciplineAction,
          discipline_notes: notes || null,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Case Resolved - Disciplinary Sanction Imposed',
          description: `Disciplinary Action: ${disciplineAction}. Notes: ${notes}`,
          actor_name: currentUser?.name || 'OSD / Principal',
          actor_role: currentUser?.role || 'Staff',
        });
      } catch (e) {
        console.warn('Could not sync stage 3 resolution to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, notes || 'Case resolved by OSD & Principal joint intervention.', {
      discipline_action: disciplineAction,
      discipline_notes: notes,
    });
  };

  // --- Stage 3 -> Stage 4: Escalate to Board of Discipline ---
  const escalateToBoard = async (incidentId, reason, notes = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Escalated to Board of Discipline';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: newStatus,
          board_referred: true,
          escalation_reason: reason,
          escalation_notes: notes || null,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Stage 3 Escalation: Escalated to Board of Discipline',
          description: `Referred for formal institutional hearing. Reason: ${reason}. Notes: ${notes}`,
          actor_name: currentUser?.name || 'OSD / Principal',
          actor_role: currentUser?.role || 'OSD',
        });
      } catch (e) {
        console.warn('Could not sync stage 3 escalation to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, `Referred to Board: ${reason}`, {
      stageNumber: 4,
      stageName: 'Board of Discipline Deliberation',
      currentHandlingOffice: 'Board of Discipline',
      board_referred: true,
      escalation_reason: reason,
      escalation_notes: notes,
    });
  };

  // --- Stage 4 -> Stage 5: Finalize Board Decision & Forward to President ---
  const finalizeBoardDecision = async (incidentId, findings, decision, punishment) => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Forwarded to School President';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: newStatus,
          hearing_notes: findings,
          board_decision: decision,
          discipline_action: punishment,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Stage 4 Completed: Board Decision & Punishment Finalized',
          description: `Findings: ${findings}. Decision: ${decision}. Punishment: ${punishment}. Forwarded to President.`,
          actor_name: currentUser?.name || 'Board Chairman',
          actor_role: 'Board of Discipline',
        });
      } catch (e) {
        console.warn('Could not sync board decision to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, `Board Findings: ${findings}`, {
      stageNumber: 5,
      stageName: 'School President Final Review',
      currentHandlingOffice: 'Office of the School President',
      board_findings: findings,
      board_decision: decision,
      punishment_imposed: punishment,
    });
  };

  // --- Stage 5 -> Finalized: Complete School President Final Review ---
  const completePresidentReview = async (incidentId, remarks = '') => {
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    const newStatus = 'Resolved';

    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: 'resolved',
          discipline_notes: remarks ? `President Final Affirmation: ${remarks}` : 'Affirmed by School President',
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Stage 5 Completed: Finalized by School President',
          description: remarks ? `Remarks: ${remarks}` : 'Executive review completed and board decision affirmed.',
          actor_name: currentUser?.name || 'Dr. Vicente Agoncillo',
          actor_role: 'School President',
        });
      } catch (e) {
        console.warn('Could not sync president review to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, remarks || 'Final executive review affirmed by School President.', {
      president_notes: remarks,
      president_finalized: true,
      president_reviewed: true,
      stageNumber: 5,
      stageName: 'School President Final Review',
      currentHandlingOffice: 'Office of the School President',
      status: 'Resolved',
    });
  };

  // --- Update Incident Status ---
  const updateIncidentStatus = async (incidentId, newStatus, remark, additionalPayload = {}) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return false;

    // Check if numeric ID exists to sync with Supabase
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = inc.numeric_id || parseInt(rawId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        let dbStatus = newStatus;
        if (newStatus === 'Resolved') dbStatus = 'resolved';
        else if (newStatus === 'Under Review' || newStatus === 'Scheduled Meeting') dbStatus = 'scheduled_meeting';
        else if (newStatus === 'Appealed') dbStatus = 'appealed';

        await supabase.from('reports').update({
          status: dbStatus,
          discipline_action: additionalPayload?.disciplineAction || additionalPayload?.discipline_action || null,
          discipline_notes: remark || additionalPayload?.discipline_notes || null,
          escalated_to: additionalPayload?.escalated_to || null,
          updated_at: new Date().toISOString(),
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: `Status: ${newStatus}`,
          description: remark || `Status changed to ${newStatus}`,
          actor_name: currentUser?.name || 'Authorized Official',
          actor_role: currentUser?.role || 'Admin',
        });
      } catch (e) {
        console.warn('Could not sync status update to Supabase:', e);
      }
    }

    const oldStatus = inc.status;
    const historyEntry = {
      from_status: oldStatus,
      to_status: newStatus,
      changed_by: currentUser?.name || 'Authorized Official',
      role: currentUser?.role || 'Admin',
      remark: remark || 'Status updated.',
      timestamp: new Date().toISOString(),
    };

    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id === incidentId) {
          return {
            ...i,
            status: newStatus,
            remarks: remark,
            updated_at: new Date().toISOString(),
            status_history: [...(i.status_history || []), historyEntry],
            ...additionalPayload,
          };
        }
        return i;
      })
    );

    // If status changed to Expelled, create expulsion record if not exists
    if (newStatus === 'Expelled' && additionalPayload.expulsionData) {
      issueExpulsion(incidentId, additionalPayload.expulsionData);
    }

    // If status changed to Community Service, register tracker
    if (newStatus === 'Community Service' && additionalPayload.serviceData) {
      assignCommunityService(incidentId, additionalPayload.serviceData);
    }

    logAudit('STATUS_CHANGE', 'Incident Report', inc.case_number, `Changed status from '${oldStatus}' to '${newStatus}'. Remark: "${remark}"`);

    // Notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        role: 'all_admin',
        title: `Case Status Updated: ${inc.case_number}`,
        message: `${inc.student_name}: Status updated to '${newStatus}' by ${currentUser?.name}.`,
        type: 'report',
        is_read: false,
        timestamp: new Date().toISOString(),
        link: inc.id,
      },
      ...prev,
    ]);

    return true;
  };

  // --- Case Escalation Helper ---
  const escalateIncident = async (incidentId, targetRole, reason, notes = '') => {
    let newStatus = `Escalated to ${targetRole}`;
    if (targetRole.toLowerCase().includes('ministro')) {
      newStatus = 'Escalated to Ministrong Tagasubaybay';
    } else if (targetRole.toLowerCase().includes('osd')) {
      newStatus = 'Escalated to OSD';
    } else if (targetRole.toLowerCase().includes('principal')) {
      newStatus = 'Escalated to Principal';
    }

    const payload = {
      escalation_reason: reason,
      escalation_notes: notes,
      escalated_to: targetRole,
    };

    // If syncing with Supabase
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: newStatus,
          escalation_reason: reason,
          escalation_notes: notes,
          escalated_to: targetRole,
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: `Case Escalated to ${targetRole}`,
          description: notes ? `Reason: ${reason}. Notes: ${notes}` : `Reason: ${reason}`,
          actor_name: currentUser?.name || 'Authorized Official',
          actor_role: currentUser?.role || 'Staff',
        });
      } catch (e) {
        console.warn('Could not sync escalation to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, newStatus, `Escalation Reason: ${reason}`, payload);
  };

  // --- Refer Case to Board of Discipline ---
  const referToBoard = async (incidentId, hearingNotes = '') => {
    const payload = {
      board_referred: true,
      hearing_notes: hearingNotes,
    };

    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: 'Referred to Board of Discipline',
          board_referred: true,
          hearing_notes: hearingNotes,
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Case Referred to Board of Discipline',
          description: 'Referred for formal hearing and institutional disciplinary board deliberation.',
          actor_name: currentUser?.name || 'OSD Official',
          actor_role: currentUser?.role || 'OSD',
        });
      } catch (e) {
        console.warn('Could not sync board referral to Supabase:', e);
      }
    }

    return updateIncidentStatus(incidentId, 'Referred to Board of Discipline', 'Case formally referred to the Board of Discipline.', payload);
  };

  // --- Record Board of Discipline Deliberation & Decision ---
  const recordBoardDeliberation = async (incidentId, hearingNotes, recommendations, decision) => {
    const payload = {
      hearing_notes: hearingNotes,
      board_recommendations: recommendations,
      board_decision: decision,
      board_referred: true,
    };

    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = parseInt(rawId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await supabase.from('reports').update({
          status: decision ? `Resolved (${decision})` : 'Under Review (Board Hearing)',
          hearing_notes: hearingNotes,
          board_recommendations: recommendations,
          board_decision: decision,
        }).eq('id', numId);

        await supabase.from('timeline_events').insert({
          report_id: numId,
          title: 'Board of Discipline Hearing Conducted',
          description: `Recommendations: ${recommendations}. Decision: ${decision || 'Pending Final Resolution'}`,
          actor_name: currentUser?.name || 'Board Chairman',
          actor_role: 'Board of Discipline',
        });
      } catch (e) {
        console.warn('Could not sync board deliberation to Supabase:', e);
      }
    }

    const finalStatus = decision ? `Resolved` : 'Ongoing Report';
    return updateIncidentStatus(incidentId, finalStatus, `Board Findings: ${recommendations}`, payload);
  };

  // --- Assign Handler ---
  const assignHandler = (incidentId, handlerId, handlerName) => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id === incidentId) {
          return { ...i, handler_id: handlerId, handler_name: handlerName, updated_at: new Date().toISOString() };
        }
        return i;
      })
    );
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      logAudit('ASSIGN', 'Incident Report', inc.case_number, `Assigned case handler to ${handlerName}`);
    }
  };

  // --- Appeals Handling ---
  const submitAppeal = (incidentId, appealData) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const newAppeal = {
      id: `app_${Date.now()}`,
      incident_id: incidentId,
      case_number: inc.case_number,
      student_name: inc.student_name,
      student_lrn: inc.student_lrn,
      appeal_date: new Date().toISOString(),
      status: 'Pending',
      ...appealData,
    };

    setAppeals((prev) => [newAppeal, ...prev]);
    updateIncidentStatus(incidentId, 'Appealed', `Formal appeal contested: ${appealData.reason}`);
    logAudit('APPEAL_SUBMIT', 'Appeal Case', inc.case_number, `Submitted appeal on behalf of ${inc.student_name}`);
  };

  const reviewAppeal = (appealId, decision, justification) => {
    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;

    setAppeals((prev) =>
      prev.map((a) => {
        if (a.id === appealId) {
          return {
            ...a,
            status: decision,
            outcome_justification: justification,
            reviewed_by: currentUser?.name || 'Atty. Roberto Mendoza (OSD)',
            reviewed_at: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    // Update incident status according to appeal outcome
    let nextStatus = 'Ongoing Report';
    if (decision === 'Upheld') nextStatus = 'Resolved';
    if (decision === 'Overturned') nextStatus = 'Resolved';
    if (decision === 'Reduced') nextStatus = 'Community Service';

    updateIncidentStatus(appeal.incident_id, nextStatus, `Appeal Review Decision (${decision}): ${justification}`);
    logAudit('APPEAL_DECISION', 'Appeal Case', appeal.case_number, `Rendered decision '${decision}'. Justification: ${justification}`);
  };

  // --- Community Service Tracker ---
  const assignCommunityService = (incidentId, serviceData) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const newService = {
      id: `cs_${Date.now()}`,
      incident_id: incidentId,
      case_number: inc.case_number,
      student_id: inc.student_id,
      student_name: inc.student_name,
      student_lrn: inc.student_lrn,
      grade: inc.grade,
      section: inc.section,
      required_hours: serviceData.required_hours || 10,
      completed_hours: 0,
      supervisor_name: serviceData.supervisor_name || 'Property Custodian / Guidance Office',
      task_description: serviceData.task_description || 'Campus community service',
      assigned_date: new Date().toISOString(),
      completion_deadline: serviceData.completion_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'In Progress',
      logs: [],
    };

    setCommunityServices((prev) => [newService, ...prev]);
    logAudit('COMMUNITY_SERVICE_ASSIGN', 'Community Service', inc.case_number, `Assigned ${serviceData.required_hours} hours to ${inc.student_name}`);
  };

  const logCommunityServiceHours = (serviceId, logData) => {
    setCommunityServices((prev) =>
      prev.map((cs) => {
        if (cs.id === serviceId) {
          const newCompleted = cs.completed_hours + Number(logData.hours);
          const isComplete = newCompleted >= cs.required_hours;
          const updatedLogs = [
            ...cs.logs,
            {
              id: `csl_${Date.now()}`,
              date: logData.date || new Date().toISOString().split('T')[0],
              hours: Number(logData.hours),
              activity: logData.activity,
              supervisor: logData.supervisor || cs.supervisor_name,
              remark: logData.remark || 'Logged service hours',
            },
          ];

          if (isComplete) {
            // Auto-resolve incident
            updateIncidentStatus(
              cs.incident_id,
              'Resolved',
              `Completed all required community service hours (${cs.required_hours}/${cs.required_hours} hrs). Good citizenship restored.`
            );
          }

          return {
            ...cs,
            completed_hours: newCompleted,
            status: isComplete ? 'Completed' : 'In Progress',
            logs: updatedLogs,
          };
        }
        return cs;
      })
    );

    const cs = communityServices.find((c) => c.id === serviceId);
    if (cs) {
      logAudit('COMMUNITY_SERVICE_LOG', 'Community Service', cs.case_number, `Logged ${logData.hours} hours for ${cs.student_name}`);
    }
  };

  // --- Expulsion Management ---
  const issueExpulsion = (incidentId, expulsionData) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    const newExpulsion = {
      id: `exp_${Date.now()}`,
      incident_id: incidentId,
      case_number: inc.case_number,
      student_id: inc.student_id,
      student_name: inc.student_name,
      student_lrn: inc.student_lrn,
      grade: inc.grade,
      section: inc.section,
      resolution_number: expulsionData.resolution_number || `HHS-OSD-RES-${new Date().getFullYear()}-${String(expulsions.length + 1).padStart(3, '0')}`,
      effective_date: expulsionData.effective_date || new Date().toISOString().split('T')[0],
      deped_endorsement_no: expulsionData.deped_endorsement_no || `DEPED-NCR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      signatory: expulsionData.signatory || `${currentUser?.name} (OSD Head) & Dr. Alicia Magalong (Principal)`,
      grounds: expulsionData.grounds || inc.description,
      transfer_clearance_status: 'Endorsed to Schools Division Office for Alternative Learning Assistance',
      confidential_notes: expulsionData.confidential_notes || 'Expulsion order executed following full procedural due process.',
    };

    setExpulsions((prev) => [newExpulsion, ...prev]);

    // Update student status
    setStudents((prev) =>
      prev.map((s) => (s.id === inc.student_id ? { ...s, status: 'Expelled' } : s))
    );

    logAudit('EXPULSION_ORDER', 'Expulsion Record', inc.case_number, `Formal expulsion issued for ${inc.student_name} (${newExpulsion.resolution_number})`);
  };

  // --- Student Queries ---
  const getStudentById = (studentId) => {
    return students.find((s) => s.id === studentId);
  };

  const getStudentIncidents = (studentId) => {
    return incidents.filter((i) => i.student_id === studentId);
  };

  const isRepeatOffender = (studentId) => {
    return getStudentIncidents(studentId).length >= 2;
  };

  // --- Notification Methods ---
  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // --- Settings Update ---
  const addCategory = (categoryObj) => {
    setSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, { id: `cat_${Date.now()}`, ...categoryObj }],
    }));
    logAudit('SETTINGS_UPDATE', 'System Configuration', 'Offense Categories', `Added category: ${categoryObj.name}`);
  };

  const addSection = (sectionName) => {
    if (!settings.sections.includes(sectionName)) {
      setSettings((prev) => ({
        ...prev,
        sections: [...prev.sections, sectionName],
      }));
      logAudit('SETTINGS_UPDATE', 'System Configuration', 'Grade/Sections', `Added section: ${sectionName}`);
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        students,
        incidents,
        appeals,
        communityServices,
        expulsions,
        auditLogs,
        notifications,
        settings,
        createIncident,
        createAnonymousReport,
        updateIncidentStatus,
        forwardForInitialIntervention,
        resolveInitialIntervention,
        escalateToOsdAndPrincipal,
        resolveOsdAndPrincipal,
        escalateToBoard,
        finalizeBoardDecision,
        completePresidentReview,
        determineGradeAssignments,
        escalateIncident,
        referToBoard,
        recordBoardDeliberation,
        assignHandler,
        submitAppeal,
        reviewAppeal,
        assignCommunityService,
        logCommunityServiceHours,
        issueExpulsion,
        getStudentById,
        getStudentIncidents,
        isRepeatOffender,
        logAudit,
        markNotificationRead,
        markAllNotificationsRead,
        addCategory,
        addSection,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => useContext(IncidentContext);
