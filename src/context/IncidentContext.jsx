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

const IncidentContext = createContext();

export const IncidentProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('hayagsync_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('hayagsync_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [appeals, setAppeals] = useState(() => {
    const saved = localStorage.getItem('hayagsync_appeals');
    return saved ? JSON.parse(saved) : INITIAL_APPEALS;
  });

  const [communityServices, setCommunityServices] = useState(() => {
    const saved = localStorage.getItem('hayagsync_services');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_SERVICES;
  });

  const [expulsions, setExpulsions] = useState(() => {
    const saved = localStorage.getItem('hayagsync_expulsions');
    return saved ? JSON.parse(saved) : INITIAL_EXPULSIONS;
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
            let uiStatus = 'Recent Report';
            if (rawStatus === 'resolved') uiStatus = 'Resolved';
            else if (rawStatus === 'scheduled_meeting') uiStatus = 'Under Review';
            else if (rawStatus === 'escalated') uiStatus = 'Escalated to OSD';
            else if (rawStatus === 'appealed') uiStatus = 'Appealed';

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
              evidence_url: r.evidence_url,
              evidence_verification_state: r.evidence_verification_state || 'Unverified',
              ai_summary: r.ai_summary,
              discipline_action: r.discipline_action,
              discipline_notes: r.discipline_notes,
              appealed_reason: r.appealed_reason,
              appeal_count: r.appeal_count || 0,
              bully_name: r.bully_name,
              bully_grade_section: r.bully_grade_section,
              created_at: r.created_at,
              updated_at: r.updated_at,
              reporter_name: r.parent_name || 'Parent',
              reporter_role: 'Parent',
              status_history: [
                {
                  from_status: 'None',
                  to_status: uiStatus,
                  changed_by: r.parent_name || 'System',
                  role: 'Reporter',
                  remark: 'Cloud synced record from Supabase database.',
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

  // --- Update Incident Status ---
  const updateIncidentStatus = async (incidentId, newStatus, remark, additionalPayload = {}) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return false;

    // Check if numeric ID exists to sync with Supabase
    const rawId = incidentId.replace('rep_', '').replace('inc_', '');
    const numId = inc.numeric_id || parseInt(rawId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        let dbStatus = 'Pending';
        if (newStatus === 'Resolved') dbStatus = 'resolved';
        else if (newStatus === 'Under Review' || newStatus === 'Scheduled Meeting') dbStatus = 'scheduled_meeting';
        else if (newStatus.includes('Escalat')) dbStatus = 'Escalated';
        else if (newStatus === 'Appealed') dbStatus = 'appealed';

        await supabase.from('reports').update({
          status: dbStatus,
          discipline_action: additionalPayload?.disciplineAction || null,
          discipline_notes: remark || null,
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
        updateIncidentStatus,
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
