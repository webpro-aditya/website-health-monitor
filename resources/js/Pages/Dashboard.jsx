import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/* ─── SVG Icon Components ─── */
const Icon = ({ children, size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);
const IconGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Icon>;
const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>;
const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
const IconHeart = (p) => <Icon {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Icon>;
const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
const IconMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>;
const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></Icon>;
const IconLogOut = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>;
const IconEdit = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>;
const IconTrash = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>;
const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
const IconChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>;
const IconZap = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const IconBarChart = (p) => <Icon {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
const IconMail = (p) => <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>;
const IconSave = (p) => <Icon {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon>;
const IconCheckAll = (p) => <Icon {...p}><path d="M18 6L7 17l-5-5" /><path d="M22 10L11 21" /></Icon>;
const IconXCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon>;
const IconRefreshCw = (p) => <Icon {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></Icon>;
const IconActivity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>;
const IconGripVertical = (p) => <Icon {...p}><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></Icon>;

/* ─── Sparkline Component ─── */
function Sparkline({ color }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.7 }}>
      <path d="M0 15L10 12L20 16L30 8L40 10L50 4L60 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const duration = 600;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

/* ─── Toggle Switch Component ─── */
function Toggle({ checked, onChange }) {
  return (
    <button className="whm-toggle" data-on={checked} onClick={onChange} type="button">
      <span className="whm-toggle-knob" />
    </button>
  );
}

/* ─── Collapsible Section ─── */
function Section({ title, icon, open, onToggle, children, badge, dragHandleProps, innerRef, draggableProps, draggableStyle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(open ? 'auto' : '0px');

  useEffect(() => {
    if (open) {
      const h = contentRef.current?.scrollHeight;
      setHeight(h + 'px');
      const t = setTimeout(() => setHeight('auto'), 300);
      return () => clearTimeout(t);
    } else {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight + 'px');
        // Use double requestAnimationFrame to ensure the height is applied before transitioning to 0
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeight('0px');
          });
        });
      }
    }
  }, [open]);

  return (
    <div className="whm-section" ref={innerRef} {...draggableProps} style={{ ...draggableStyle, ...(draggableProps?.style || {}) }}>
      <div className="whm-section-header" style={{ display: 'flex', alignItems: 'center' }}>
        <div
          {...dragHandleProps}
          style={{ cursor: 'grab', padding: '10px 15px 10px 0', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
          title="Drag to reorder"
        >
          <IconGripVertical size={18} />
        </div>
        <button className="whm-section-header-btn" onClick={onToggle} type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', padding: '0', cursor: 'pointer', textAlign: 'left', outline: 'none' }}>
          <div className="whm-section-left" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="whm-section-icon">{icon}</span>
            <h2 className="whm-section-title">{title}</h2>
            {badge && <span className="whm-section-badge">{badge}</span>}
          </div>
          <span className={`whm-section-chevron ${open ? 'open' : ''}`}>
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>
      <div className="whm-section-body" ref={contentRef} style={{ height, overflow: height === 'auto' ? 'visible' : 'hidden', transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <div className="whm-section-inner">
          {children}
        </div>
      </div>
    </div>
  );
}



/* ─── Country Code Selector Component (Portal-based) ─── */
const CountryCodeSelector = ({ value, onChange, countries }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const openDropdown = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: 250
            });
        }
        setIsOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && 
                containerRef.current && !containerRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const filtered = countries.filter(c => 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (c.dial_code || '').includes(search)
    );

    return (
        <div ref={containerRef} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <button
                type="button"
                className="whm-form-input"
                style={{ width: '90px', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{value || '+91'}</span>
                <IconChevronDown size={14} />
            </button>
            
            {isOpen && window.document.body && createPortal(
                <div ref={dropdownRef} className="whm-country-dropdown" style={{ pointerEvents: 'auto', position: 'absolute', top: coords.top, left: coords.left, width: coords.width + 'px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '4px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)', zIndex: 999999, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <IconSearch size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="whm-form-input"
                                style={{ width: '100%', padding: '6px 8px 6px 30px', fontSize: '13px', background: 'var(--surface)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-sm)' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg-primary)' }} className="whm-scrollable-menu">
                        {filtered.map((c, i) => (
                            <div 
                                key={i}
                                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: value === c.dial_code ? 'var(--surface-hover)' : 'transparent', transition: 'all 0.1s ease', borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                                onClick={() => {
                                    onChange(c.dial_code);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-active)'; e.currentTarget.style.paddingLeft = '16px'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = value === c.dial_code ? 'var(--surface-hover)' : 'transparent'; e.currentTarget.style.paddingLeft = '12px'; }}
                            >
                                <span style={{ fontSize: '13px', color: value === c.dial_code ? 'var(--accent-light)' : 'var(--text-primary)', fontWeight: value === c.dial_code ? '600' : '400' }}>{c.name}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{c.dial_code}</span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No countries found matching "{search}"</div>
                        )}
                    </div>
                </div>,
                document.querySelector('.whm-root') || document.body
            )}
        </div>
    );
};

export default function Dashboard({ domains, initialAlertEmails = [], initialAlertPhones = [], initialAdvancedSettings }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const [countriesData, setCountriesData] = useState([]);
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/codes')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const sorted = data.data.sort((a,b) => a.name.localeCompare(b.name));
          setCountriesData(sorted);
        }
      })
      .catch(err => console.error('Failed to fetch countries:', err));
  }, []);

  const { data, setData, post, put, reset, processing, errors, clearErrors } = useForm({
    domain_name: '',
    url: '',
  });

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dark, setDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [secDomains, setSecDomains] = useState(true);
  const [secNotif, setSecNotif] = useState(true);
  const [secAdv, setSecAdv] = useState(false);

  const [alertEmails, setAlertEmails] = useState(initialAlertEmails?.length > 0 ? initialAlertEmails : ['']);
  const parsePhones = (phones) => {
    if (!phones || phones.length === 0) return [{ isd: '+91', num: '' }];
    return phones.map(p => {
      if (p.includes('-')) {
        const [isd, num] = p.split('-');
        return { isd, num };
      }
      return { isd: '+91', num: p };
    });
  };
  const [alertPhones, setAlertPhones] = useState(parsePhones(initialAlertPhones));
  
  const getPhonesPayload = (phones) => phones.map(p => `${p.isd}-${p.num}`);

  const defaultSettings = [
    { icon: <IconClock size={16} />, label: 'Strict Timeout (5s)', on: false },
    { icon: <IconRefreshCw size={16} />, label: 'Auto-Retry on Fail', on: true },
    { icon: <IconShield size={16} />, label: 'Ignore SSL Errors', on: false },
    { icon: <IconActivity size={16} />, label: 'Verbose Logging', on: false },
    { icon: <IconBell size={16} />, label: 'Push Notifications', on: true },
    { icon: <IconEye size={16} />, label: 'Follow Redirects', on: true },
  ];

  const [settings, setSettings] = useState(() => {
    if (initialAdvancedSettings && initialAdvancedSettings.length === defaultSettings.length) {
      return defaultSettings.map((s, i) => ({ ...s, on: initialAdvancedSettings[i].on }));
    }
    return defaultSettings;
  });

  useEffect(() => {
    const saved = localStorage.getItem('whm-theme');
    if (saved === 'light') setDark(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('whm-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const defaultOrder = ['domains', 'notif', 'adv'];
  const [sectionOrder, setSectionOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(`whm-dashboard-order-${user.id}`);
      return saved ? JSON.parse(saved) : defaultOrder;
    } catch (e) {
      return defaultOrder;
    }
  });

  useEffect(() => {
    localStorage.setItem(`whm-dashboard-order-${user.id}`, JSON.stringify(sectionOrder));
  }, [sectionOrder, user.id]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSectionOrder(items);
  };

  const openAddModal = () => { reset(); clearErrors(); setIsEdit(false); setEditId(null); setIsModalOpen(true); };
  const openEditModal = (d) => {
    clearErrors();
    setData({ domain_name: d.name, url: d.url, status: d.enabled ? 'enabled' : 'disabled' });
    setIsEdit(true); setEditId(d.id); setIsModalOpen(true);
  };
  const submit = (e) => {
    e.preventDefault();
    if (isEdit) put(route('domains.update', editId), { onSuccess: () => setIsModalOpen(false) });
    else post(route('domains.store'), { onSuccess: () => setIsModalOpen(false) });
  };
  const toggleStatus = (d) => {
    router.put(route('domains.update', d.id), { domain_name: d.name, url: d.url, status: d.enabled ? 'disabled' : 'enabled' });
  };
  const deleteDomain = (id) => {
    Swal.fire({
      title: 'Delete Domain?',
      text: "Are you sure you want to remove this domain?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: dark ? '#2e335a' : '#94a3b8',
      confirmButtonText: 'Yes, delete it',
      background: dark ? '#0c0d1a' : '#ffffff',
      color: dark ? '#eef2ff' : '#0f172a',
      customClass: {
        popup: 'whm-swal-popup',
        confirmButton: 'whm-btn whm-btn-primary',
        cancelButton: 'whm-btn whm-btn-ghost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('domains.destroy', id));
      }
    });
  };

  const removeEmail = (idx) => {
    Swal.fire({
      title: 'Remove Email?',
      text: "Are you sure you want to remove this email address?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: dark ? '#2e335a' : '#94a3b8',
      confirmButtonText: 'Yes, remove it',
      background: dark ? '#0c0d1a' : '#ffffff',
      color: dark ? '#eef2ff' : '#0f172a',
      customClass: {
        popup: 'whm-swal-popup',
        confirmButton: 'whm-btn whm-btn-primary',
        cancelButton: 'whm-btn whm-btn-ghost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newEmails = alertEmails.filter((_, i) => i !== idx);
        setAlertEmails(newEmails);
        router.post(route('notifications.save'), { emails: newEmails, phones: getPhonesPayload(alertPhones) }, { preserveScroll: true });
      }
    });
  };

  const removePhone = (idx) => {
    Swal.fire({
      title: 'Remove Phone Number?',
      text: "Are you sure you want to remove this phone number?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: dark ? '#2e335a' : '#94a3b8',
      confirmButtonText: 'Yes, remove it',
      background: dark ? '#0c0d1a' : '#ffffff',
      color: dark ? '#eef2ff' : '#0f172a',
      customClass: {
        popup: 'whm-swal-popup',
        confirmButton: 'whm-btn whm-btn-primary',
        cancelButton: 'whm-btn whm-btn-ghost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newPhones = alertPhones.filter((_, i) => i !== idx);
        setAlertPhones(newPhones);
        router.post(route('notifications.save'), { emails: alertEmails, phones: getPhonesPayload(newPhones) }, { preserveScroll: true });
      }
    });
  };

  const setAll = (enabled) => { router.post(route('domains.set_all'), { enabled }); };
  const toggleSetting = (idx) => {
    const newSettings = settings.map((s, i) => i === idx ? { ...s, on: !s.on } : s);
    setSettings(newSettings);
    router.post(route('settings.advanced.save'), {
      settings: newSettings.map(s => ({ on: s.on }))
    }, { preserveScroll: true });
  };

  const total = domains ? domains.length : 0;
  const active = domains ? domains.filter(d => d.enabled).length : 0;
  const down = domains ? domains.filter(d => d.status === 'DOWN').length : 0;
  const up = domains ? domains.filter(d => d.status === 'UP').length : 0;

  const filteredDomains = (domains || []).filter(d => {
    const name = (d.name || '').toLowerCase();
    const url = (d.url || '').toLowerCase();
    const status = d.status || 'DISABLED';
    return (name.includes(searchQuery.toLowerCase()) || url.includes(searchQuery.toLowerCase()))
      && (statusFilter === 'All Status' || status === statusFilter);
  });

  const statCards = [
    { label: 'Total Domains', value: total, icon: <IconGlobe size={20} />, color: '#0ea5e9', accent: '#0284c7' },
    { label: 'Active Monitoring', value: active, icon: <IconCheck size={20} />, color: '#10b981', accent: '#059669' },
    { label: 'Currently Down', value: down, icon: <IconAlertTriangle size={20} />, color: '#ef4444', accent: '#dc2626' },
    { label: 'Healthy Sites', value: up, icon: <IconHeart size={20} />, color: '#06b6d4', accent: '#0891b2' },
  ];



  const statusMap = {
    UP: { cls: 'whm-badge-up', label: 'Operational' },
    DOWN: { cls: 'whm-badge-down', label: 'Down' },
    DISABLED: { cls: 'whm-badge-disabled', label: 'Disabled' },
  };

  return (
    <>
      <Head>
        <title>Dashboard — Website Health Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_CSS }} />

      <div className="whm-root" data-theme={dark ? 'dark' : 'light'}>
        {/* Ambient background orbs */}
        <div className="whm-bg-orb whm-bg-orb-1" />
        <div className="whm-bg-orb whm-bg-orb-2" />
        <div className="whm-bg-orb whm-bg-orb-3" />

        {/* ── MODAL ── */}
        {isModalOpen && (
          <div className="whm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
            <div className="whm-modal">
              <div className="whm-modal-header">
                <h3 className="whm-modal-title">{isEdit ? 'Edit Domain' : 'Add New Domain'}</h3>
                <button className="whm-modal-close" onClick={() => setIsModalOpen(false)}><IconX size={16} /></button>
              </div>
              <form onSubmit={submit}>
                <div className="whm-form-group">
                  <label className="whm-form-label"><IconEdit size={14} /> Domain Alias</label>
                  <input type="text" className={`whm-form-input ${errors.domain_name ? 'is-invalid' : ''}`} placeholder="e.g. Production API" value={data.domain_name} onChange={e => setData('domain_name', e.target.value)} required />
                  {errors.domain_name && <div className="whm-invalid-feedback" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.domain_name}</div>}
                </div>
                <div className="whm-form-group">
                  <label className="whm-form-label"><IconGlobe size={14} /> URL Endpoint</label>
                  <input type="url" className={`whm-form-input ${errors.url ? 'is-invalid' : ''}`} placeholder="https://api.example.com" value={data.url} onChange={e => setData('url', e.target.value)} required />
                  {errors.url && <div className="whm-invalid-feedback" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.url}</div>}
                </div>
                <div className="whm-modal-actions">
                  <button type="button" className="whm-btn whm-btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="whm-btn whm-btn-primary" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Domain'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="whm-container">

          {/* ── HEADER ── */}
          <header className="whm-header">
            <div className="whm-header-left">
              <div className="whm-logo">
                <IconShield size={22} />
              </div>
              <div>
                <h1 className="whm-brand">Website Health Monitor</h1>
                <p className="whm-tagline"><span className="whm-live-dot" /> Real-time uptime · response time · alerts</p>
              </div>
            </div>
            <div className="whm-header-actions">
              <div className="whm-user-chip">
                <div className="whm-user-avatar">{user.name ? user.name[0].toUpperCase() : '?'}</div>
                <span className="whm-user-name">{user.name}</span>
              </div>
              <button className="whm-btn whm-btn-icon" onClick={() => setDark(!dark)} title={dark ? 'Switch to Light' : 'Switch to Dark'}>
                {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </button>
              <button className="whm-btn whm-btn-primary" onClick={openAddModal}>
                <IconPlus size={16} /> Add Domain
              </button>

              <a href={route('logout.get')} className="whm-btn whm-btn-ghost-muted" style={{ textDecoration: 'none' }}>
                <IconLogOut size={16} /> Logout
              </a>
            </div>
          </header>

          {/* ── STAT CARDS ── */}
          <div className="whm-stats-grid">
            {statCards.map((s, i) => (
              <div className="whm-stat-card" key={i} style={{ borderLeft: `3px solid ${s.color}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="whm-stat-icon" style={{ background: `${s.color}22`, color: s.color, width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <Sparkline color={s.color} />
                </div>
                <div className="whm-stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="whm-stat-value" style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1 }}>
                    <AnimatedCount value={s.value} />
                  </span>
                  <span className="whm-stat-label" style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '500' }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="dashboard-sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="whm-sections-container">
                  {sectionOrder.map((sectionId, index) => {
                    let sectionContent = null;

                    if (sectionId === 'domains') {
                      sectionContent = (
                        <Section
                          title="Domain Management"
                          icon={<IconGlobe size={20} />}
                          open={secDomains}
                          onToggle={() => setSecDomains(!secDomains)}
                          badge={`${filteredDomains.length} domain${filteredDomains.length !== 1 ? 's' : ''}`}
                        >
                          <div className="whm-table-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div className="whm-search-box" style={{ flex: 1, minWidth: '200px' }}>
                              <IconSearch size={16} />
                              <input type="text" placeholder="Search domains…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="whm-btn whm-btn-ghost" onClick={() => setAll(true)} title="Enable All">
                                <IconCheckAll size={14} /> Enable All
                              </button>
                              <button className="whm-btn whm-btn-ghost" onClick={() => setAll(false)} title="Disable All">
                                <IconXCircle size={14} /> Disable All
                              </button>
                              <select className="whm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                <option value="All Status">All Status</option>
                                <option value="UP">Operational</option>
                                <option value="DOWN">Down</option>
                                <option value="DISABLED">Disabled</option>
                              </select>
                            </div>
                          </div>
                          <div className="whm-table-wrap">
                            <table className="whm-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Domain</th>
                                  <th>URL</th>
                                  <th>Status</th>
                                  <th>Response</th>
                                  <th>Last Checked</th>
                                  <th>Actions</th>
                                  <th>Enabled</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredDomains.map((d, idx) => {
                                  const st = statusMap[d.status || 'DISABLED'];
                                  return (
                                    <tr key={d.id}>
                                      <td><span className="whm-row-num">{idx + 1}</span></td>
                                      <td>
                                        <div className="whm-domain-cell">
                                          <div className="whm-domain-avatar">{d.name ? d.name[0].toUpperCase() : '?'}</div>
                                          <span className="whm-domain-name">{d.name}</span>
                                        </div>
                                      </td>
                                      <td><a href={d.url} target="_blank" rel="noreferrer" className="whm-url-link">{d.url}</a></td>
                                      <td><span className={`whm-badge ${st.cls}`}>{st.label}</span></td>
                                      <td><span className={`whm-response ${d.response && d.response !== '--' ? 'has-value' : ''}`}>{d.response || '—'}</span></td>
                                      <td><span className="whm-time">{d.checked || 'Never'}</span></td>
                                      <td>
                                        <div className="whm-action-btns">
                                          <button className="whm-action-btn whm-action-edit" onClick={() => openEditModal(d)} title="Edit"><IconEdit size={14} /></button>
                                          <button className="whm-action-btn whm-action-delete" onClick={() => deleteDomain(d.id)} title="Delete"><IconTrash size={14} /></button>
                                        </div>
                                      </td>
                                      <td><Toggle checked={d.enabled} onChange={() => toggleStatus(d)} /></td>
                                    </tr>
                                  );
                                })}
                                {filteredDomains.length === 0 && (
                                  <tr>
                                    <td colSpan="8">
                                      <div className="whm-empty-state">
                                        <div className="whm-empty-icon"><IconGlobe size={40} /></div>
                                        <p className="whm-empty-title">No domains yet</p>
                                        <p className="whm-empty-desc">Add your first domain to start monitoring its health.</p>
                                        <button className="whm-btn whm-btn-primary" onClick={openAddModal} style={{ marginTop: '12px' }}>
                                          <IconPlus size={16} /> Add Your First Domain
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </Section>
                      );
                    } else if (sectionId === 'notif') {
                      sectionContent = (
                        <Section title="Notification Preferences" icon={<IconBell size={20} />} open={secNotif} onToggle={() => setSecNotif(!secNotif)}>
                          <div className="whm-notif-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="whm-notif-section">
                              <label className="whm-form-label" style={{ marginBottom: '10px' }}>
                                📧 Emails
                              </label>
                              <div className="whm-notif-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                                {alertEmails.map((email, idx) => (
                                  <div className="whm-email-row" key={'email-' + idx} style={{ display: 'flex', width: '100%' }}>
                                    <input type="email" className="whm-form-input" style={{ flex: 1, borderTopRightRadius: alertEmails.length > 1 ? 0 : 'var(--radius-md)', borderBottomRightRadius: alertEmails.length > 1 ? 0 : 'var(--radius-md)' }} placeholder="admin@example.com" value={email} onChange={(e) => {
                                      const n = [...alertEmails]; n[idx] = e.target.value; setAlertEmails(n);
                                    }} />
                                    {alertEmails.length > 1 && (
                                      <button className="whm-btn-remove" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 0, background: 'var(--surface-hover)', border: '1px solid var(--border)', borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => removeEmail(idx)} title="Remove">
                                        <IconX size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button className="whm-btn whm-btn-ghost" onClick={() => setAlertEmails([...alertEmails, ''])}>
                                  <IconPlus size={14} /> Add Email
                                </button>
                              </div>
                            </div>

                            <div className="whm-notif-section">
                              <label className="whm-form-label" style={{ marginBottom: '10px' }}>
                                📱 SMS
                              </label>
                              <div className="whm-notif-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                                {alertPhones.map((phone, idx) => (
                                  <div className="whm-phone-row" key={'phone-' + idx} style={{ display: 'flex', width: '100%' }}>
                                    <CountryCodeSelector 
                                      value={phone.isd}
                                      onChange={(val) => {
                                        const n = [...alertPhones]; n[idx].isd = val; setAlertPhones(n);
                                      }}
                                      countries={countriesData}
                                    />
                                    <input 
                                      type="text" 
                                      className="whm-form-input" 
                                      style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: alertPhones.length > 1 ? 0 : 'var(--radius-md)', borderBottomRightRadius: alertPhones.length > 1 ? 0 : 'var(--radius-md)' }} 
                                      placeholder="9876543210" 
                                      value={phone.num} 
                                      onChange={(e) => {
                                        const n = [...alertPhones]; n[idx].num = e.target.value; setAlertPhones(n);
                                      }} 
                                    />
                                    {alertPhones.length > 1 && (
                                      <button className="whm-btn-remove" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 0, background: 'var(--surface-hover)', border: '1px solid var(--border)', borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => removePhone(idx)} title="Remove">
                                        <IconX size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button className="whm-btn whm-btn-ghost" onClick={() => setAlertPhones([...alertPhones, { isd: '+91', num: '' }])}>
                                  <IconPlus size={14} /> Add Phone
                                </button>
                              </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                              <button className="whm-btn whm-btn-primary" onClick={() => router.post(route('notifications.save'), { emails: alertEmails, phones: getPhonesPayload(alertPhones) }, { preserveScroll: true })}>
                                Save Preferences
                              </button>
                            </div>
                          </div>
                        </Section>
                      );
                    } else if (sectionId === 'adv') {
                      sectionContent = (
                        <Section title="Advanced Monitoring Settings" icon={<IconSettings size={20} />} open={secAdv} onToggle={() => setSecAdv(!secAdv)}>
                          <div className="whm-settings-grid">
                            {settings.map((s, i) => (
                              <div className="whm-setting-row" key={i}>
                                <div className="whm-setting-info">
                                  <span className="whm-setting-icon">{s.icon}</span>
                                  <span className="whm-setting-label">{s.label}</span>
                                </div>
                                <Toggle checked={s.on} onChange={() => toggleSetting(i)} />
                              </div>
                            ))}
                          </div>
                        </Section>
                      );
                    }

                    if (!sectionContent) return null;

                    return (
                      <Draggable key={sectionId} draggableId={sectionId} index={index}>
                        {(provided) => (
                          <div style={{ marginBottom: '24px' }}>
                            {React.cloneElement(sectionContent, {
                              innerRef: provided.innerRef,
                              draggableProps: provided.draggableProps,
                              dragHandleProps: provided.dragHandleProps,
                              draggableStyle: provided.draggableProps.style
                            })}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* ── FOOTER ── */}
          <footer className="whm-footer">
            <span>Website Health Monitor</span>
            <span className="whm-footer-dot">·</span>
            <span className="whm-footer-status"><span className="whm-live-dot" /> All systems operational</span>
            <span className="whm-footer-dot">·</span>
            <span>Last refreshed just now</span>
          </footer>
        </div>
      </div>
    </>
  );
}


/* ════════════════════════════════════════════════════
   Premium Dashboard CSS
   ════════════════════════════════════════════════════ */
const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── Design Tokens ── */
.whm-root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --surface: rgba(255,255,255,0.03);
  --surface-hover: rgba(255,255,255,0.06);
  --surface-active: rgba(255,255,255,0.1);
  --surface-elevated: #1e293b;
  --border: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.15);
  --border-accent: rgba(6,182,212,0.3);
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --accent: #06b6d4;
  --accent-light: #67e8f9;
  --accent-glow: rgba(6,182,212,0.15);
  --accent-glow-strong: rgba(6,182,212,0.3);
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 20px var(--accent-glow);
  --transition: 0.2s ease;
  --transition-slow: 0.3s ease;
}

.whm-root[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --surface: #ffffff;
  --surface-hover: #f8fafc;
  --surface-active: #f1f5f9;
  --surface-elevated: #ffffff;
  --border: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-accent: rgba(6,182,212,0.3);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --accent: #0891b2;
  --accent-light: #06b6d4;
  --accent-glow: rgba(8,145,178,0.1);
  --accent-glow-strong: rgba(8,145,178,0.2);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.08);
}

.whm-root[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --surface: rgba(255,255,255,0.85);
  --surface-hover: rgba(255,255,255,0.95);
  --surface-active: rgba(255,255,255,1);
  --border: rgba(99,102,241,0.1);
  --border-hover: rgba(99,102,241,0.2);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --accent-glow: rgba(99,102,241,0.08);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.08);
}

/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.whm-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
/* Animated gradient background for dark mode */
.whm-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #06060e 0%, #0d0a2a 25%, #0f0c29 50%, #0a1628 75%, #06060e 100%);
  background-size: 400% 400%;
  animation: bgShift 25s ease infinite;
  z-index: 0;
}
.whm-root[data-theme="light"]::before { display: none; }
@keyframes bgShift {
  0%, 100% { background-position: 0% 50%; }
  25% { background-position: 100% 0%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
}
/* Subtle noise texture for depth */
.whm-root::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}
.whm-root[data-theme="light"]::after { display: none; }

/* ── Ambient Background ── */
.whm-bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
  animation: orbFloat 22s ease-in-out infinite;
}
.whm-root[data-theme="light"] .whm-bg-orb { opacity: 0.12; }
.whm-bg-orb-1 { width: 700px; height: 700px; background: radial-gradient(circle, #6366f1, #4338ca); top: -250px; left: -150px; }
.whm-bg-orb-2 { width: 600px; height: 600px; background: radial-gradient(circle, #a855f7, #7c3aed); bottom: -200px; right: -150px; animation-delay: -8s; }
.whm-bg-orb-3 { width: 500px; height: 500px; background: radial-gradient(circle, #0ea5e9, #0284c7); top: 45%; left: 55%; animation-delay: -15s; opacity: 0.2; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -25px) scale(1.08); }
  50% { transform: translate(-15px, 30px) scale(0.95); }
  75% { transform: translate(-30px, -10px) scale(1.03); }
}

/* ── Container ── */
.whm-container {
  max-width: 1340px;
  margin: 0 auto;
  padding: 28px 24px 40px;
  position: relative;
  z-index: 1;
}

/* ── HEADER ── */
.whm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.whm-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.whm-logo {
  width: 46px; height: 46px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 0 30px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  flex-shrink: 0;
  position: relative;
}
.whm-logo::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(99,102,241,0.6), rgba(168,85,247,0.3));
  z-index: -1;
  filter: blur(8px);
}
.whm-brand {
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 800;
  background: linear-gradient(135deg, #c7d2fe, #e9d5ff, #a5b4fc);
  background-size: 200% auto;
  animation: shimmerText 4s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}
@keyframes shimmerText {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.whm-root[data-theme="light"] .whm-brand {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
}
.whm-tagline {
  font-size: 13px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.whm-live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  display: inline-block;
  animation: livePulse 2s ease-in-out infinite;
}
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}
.whm-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.whm-btn-split {
  display: flex;
  gap: 1px;
}

/* ── USER CHIP ── */
.whm-user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 5px 14px 5px 5px;
}
.whm-user-avatar {
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.whm-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* ── BUTTONS ── */
.whm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  text-decoration: none;
  line-height: 1.4;
}
.whm-btn:active { transform: scale(0.97); }

.whm-btn-primary {
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  color: #fff;
  box-shadow: 0 4px 16px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2);
  position: relative;
  overflow: hidden;
}
.whm-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
  background-size: 250% 100%;
  animation: btnSheen 3s ease-in-out infinite;
}
@keyframes btnSheen {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
.whm-btn-primary:hover {
  box-shadow: 0 6px 28px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.3);
  transform: translateY(-2px);
}
.whm-btn-ghost {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text-primary);
}
.whm-btn-ghost:hover { background: var(--surface-hover); border-color: var(--border-hover); }
.whm-btn-ghost-muted {
  background: transparent;
  border-color: transparent;
  color: var(--text-tertiary);
}
.whm-btn-ghost-muted:hover { background: var(--surface); color: var(--text-primary); }
.whm-btn-icon {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text-secondary);
  padding: 8px;
  border-radius: var(--radius-md);
}
.whm-btn-icon:hover { background: var(--surface-hover); color: var(--accent-light); border-color: var(--border-hover); }
.whm-btn-success-subtle {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.15);
  color: #34d399;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}
.whm-btn-success-subtle:hover { background: rgba(16,185,129,0.2); }
.whm-btn-danger-subtle {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.15);
  color: #f87171;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.whm-btn-danger-subtle:hover { background: rgba(239,68,68,0.2); }

/* ── STAT CARDS ── */
.whm-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.whm-stat-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  backdrop-filter: blur(16px);
}
.whm-stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, transparent 60%);
  pointer-events: none;
}
.whm-stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-accent);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1);
}
.whm-stat-icon {
  width: 50px; height: 50px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.whm-stat-info { position: relative; z-index: 1; }
.whm-stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.whm-stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-primary);
}
.whm-stat-ring {
  position: absolute;
  top: -20px; right: -20px;
  width: 90px; height: 90px;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.08;
}

/* ── SECTIONS (Collapsible) ── */
.whm-section {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  margin-bottom: 20px;
  backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}
.whm-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(168,85,247,0.1), transparent);
  pointer-events: none;
}
.whm-root[data-theme="light"] .whm-section::before { display: none; }
.whm-section:hover { border-color: var(--border-hover); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.whm-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px 24px;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition);
  border-radius: var(--radius-xl);
}
.whm-section-header:hover { background: var(--surface-hover); }
.whm-section-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.whm-section-icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  background: var(--accent-glow);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-light);
  flex-shrink: 0;
}
.whm-section-title {
  font-size: 16px;
  font-weight: 700;
}
.whm-section-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: var(--surface-active);
  padding: 3px 10px;
  border-radius: 20px;
}
.whm-section-chevron {
  color: var(--text-tertiary);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  display: flex;
}
.whm-section-chevron.open { transform: rotate(180deg); }
.whm-section-inner { padding: 0 24px 24px; }

/* ── TABLE ── */
.whm-table-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.whm-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  color: var(--text-tertiary);
  flex: 1;
  min-width: 180px;
  transition: border-color var(--transition);
}
.whm-search-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.whm-search-box input {
  border: none;
  background: none;
  outline: none;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  width: 100%;
}
.whm-search-box input::placeholder { color: var(--text-tertiary); }
.whm-select {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition);
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
.whm-select:focus { border-color: var(--accent); }
.whm-select option { background: var(--bg-primary); color: var(--text-primary); }
.whm-table-wrap { overflow-x: auto; border-radius: var(--radius-md); }
.whm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.whm-table thead tr {
  background: var(--surface-active);
}
.whm-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
.whm-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.whm-table tbody tr {
  transition: background var(--transition);
}
.whm-table tbody tr:hover { background: var(--surface-hover); }
.whm-table tbody tr:last-child td { border-bottom: none; }
.whm-row-num { color: var(--text-tertiary); font-weight: 500; font-variant-numeric: tabular-nums; }
.whm-domain-cell { display: flex; align-items: center; gap: 10px; }
.whm-domain-avatar {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.whm-domain-name { font-weight: 600; color: var(--text-primary); }
.whm-url-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}
.whm-url-link:hover { opacity: 0.8; text-decoration: underline; }
.whm-url-link:hover { text-decoration: underline; color: #a5b4fc; }

/* ── BADGES ── */
.whm-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--surface);
  border: 1px solid var(--border);
}
.whm-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.whm-badge-up { color: var(--success); }
.whm-badge-up::before { background: var(--success); box-shadow: 0 0 6px var(--success); }
.whm-badge-down { color: var(--danger); }
.whm-badge-down::before { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
.whm-badge-disabled { color: var(--text-tertiary); }
.whm-badge-disabled::before { background: var(--text-tertiary); }
.whm-badge-disabled::before { background: #94a3b8; }

.whm-response { color: var(--text-tertiary); font-variant-numeric: tabular-nums; }
.whm-response.has-value { color: #38bdf8; font-weight: 600; }
.whm-time { color: var(--text-tertiary); font-size: 12px; }

/* ── ACTION BUTTONS ── */
.whm-action-btns { display: flex; gap: 6px; }
.whm-action-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}
.whm-action-edit:hover { background: rgba(99,102,241,0.15); color: #818cf8; border-color: rgba(99,102,241,0.3); }
.whm-action-delete:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

/* ── EMPTY STATE ── */
.whm-empty-state {
  text-align: center;
  padding: 48px 20px;
}
.whm-empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--accent-glow);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-light);
  margin: 0 auto 16px;
}
.whm-empty-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.whm-empty-desc { font-size: 13px; color: var(--text-tertiary); }

/* ── TOGGLE ── */
.whm-toggle {
  width: 44px; height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.3s, box-shadow 0.3s;
  flex-shrink: 0;
  background: var(--surface-active);
  outline: none;
}
.whm-toggle[data-on="true"] {
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  box-shadow: 0 0 12px rgba(99,102,241,0.4);
}
.whm-toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.whm-toggle[data-on="true"] .whm-toggle-knob { transform: translateX(20px); }

/* ── NOTIFICATION ── */
.whm-notif-content { width: 100%; }
.whm-setting-row:hover { background: var(--surface-hover); border-color: var(--border-hover); }
.whm-setting-info { display: flex; align-items: center; gap: 10px; }
.whm-setting-icon { color: var(--accent-light); display: flex; }
.whm-setting-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }

/* ── FEATURES GRID ── */
.whm-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.whm-feature-card {
  padding: 22px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}
.whm-feature-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.whm-feature-card:hover::before { opacity: 1; }
.whm-feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--border-accent);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.08);
}
.whm-feature-icon {
  width: 42px; height: 42px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.whm-feature-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
.whm-feature-desc { font-size: 12px; color: var(--text-tertiary); line-height: 1.7; }

/* ── FORM ── */
.whm-form-group { margin-bottom: 16px; }
.whm-form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.whm-form-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all var(--transition);
}
.whm-form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.whm-form-input.is-invalid {
  border-color: #ef4444 !important;
}
.whm-form-input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}
.whm-form-input::placeholder { color: var(--text-tertiary); }

/* ── MODAL ── */
.whm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4,4,12,0.75);
  backdrop-filter: blur(12px) saturate(1.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
.whm-root[data-theme="light"] .whm-modal-overlay { background: rgba(0,0,0,0.35); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.whm-modal {
  background: var(--surface-elevated);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(24px) saturate(1.4);
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.04);
  position: relative;
  overflow: hidden;
}
.whm-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(168,85,247,0.2), transparent);
}
.whm-root[data-theme="light"] .whm-modal { box-shadow: 0 25px 60px rgba(0,0,0,0.12); }
.whm-root[data-theme="light"] .whm-modal::before { display: none; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: none; } }
.whm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.whm-modal-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-light), #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.whm-root[data-theme="light"] .whm-modal-title {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
}
.whm-modal-close {
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}
.whm-modal-close:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
.whm-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.whm-modal-actions .whm-btn { flex: 1; justify-content: center; padding: 12px; }

/* ── FOOTER ── */
.whm-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px 0 8px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-tertiary);
  flex-wrap: wrap;
}
.whm-footer-dot { opacity: 0.4; }
.whm-footer-status { color: #34d399; display: flex; align-items: center; gap: 6px; }

/* ── Dark-mode-specific refinements ── */
.whm-root:not([data-theme="light"]) .whm-table tbody tr:hover { background: rgba(99,102,241,0.06); }
.whm-root:not([data-theme="light"]) .whm-toggle[data-on="true"] { box-shadow: 0 0 16px rgba(99,102,241,0.5), 0 0 4px rgba(99,102,241,0.3); }
.whm-root:not([data-theme="light"]) .whm-search-box:focus-within { box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 16px rgba(99,102,241,0.08); }
.whm-root:not([data-theme="light"]) .whm-form-input:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 12px rgba(99,102,241,0.08); }
.whm-root:not([data-theme="light"]) .whm-action-edit:hover { box-shadow: 0 0 12px rgba(99,102,241,0.2); }
.whm-root:not([data-theme="light"]) .whm-action-delete:hover { box-shadow: 0 0 12px rgba(239,68,68,0.2); }
.whm-root:not([data-theme="light"]) .whm-setting-row:hover { border-color: rgba(99,102,241,0.15); box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
.whm-root:not([data-theme="light"]) .whm-badge-up { box-shadow: 0 0 8px rgba(16,185,129,0.15); }
.whm-root:not([data-theme="light"]) .whm-badge-down { box-shadow: 0 0 8px rgba(239,68,68,0.15); }

/* ── SWEETALERT2 OVERRIDES ── */
.whm-swal-popup {
  border: 1px solid var(--border-hover) !important;
  border-radius: var(--radius-xl) !important;
  backdrop-filter: blur(24px) saturate(1.4) !important;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.04) !important;
}
.whm-root[data-theme="light"] .whm-swal-popup {
  box-shadow: 0 25px 60px rgba(0,0,0,0.12) !important;
}
.swal2-title, .swal2-html-container { font-family: 'Inter', sans-serif !important; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .whm-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .whm-header { flex-direction: column; align-items: flex-start; }
  .whm-header-actions { width: 100%; }
  .whm-features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .whm-container { padding: 16px 12px 32px; }
  .whm-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .whm-stat-card { padding: 16px 14px; }
  .whm-stat-value { font-size: 22px; }
  .whm-header-actions { flex-wrap: wrap; }
  .whm-btn { font-size: 12px; padding: 7px 12px; }
  .whm-section-header { padding: 16px 18px; }
  .whm-section-inner { padding: 0 18px 18px; }
  .whm-table th:nth-child(3), .whm-table td:nth-child(3),
  .whm-table th:nth-child(6), .whm-table td:nth-child(6) { display: none; }
  .whm-features-grid { grid-template-columns: 1fr; }
}
@media (max-width: 400px) {
  .whm-stats-grid { grid-template-columns: 1fr; }
  .whm-table th:nth-child(5), .whm-table td:nth-child(5) { display: none; }
  .whm-settings-grid { grid-template-columns: 1fr; }
}

.whm-scrollable-menu::-webkit-scrollbar {
  width: 6px;
}
.whm-scrollable-menu::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
.whm-scrollable-menu::-webkit-scrollbar-thumb {
  background-color: var(--border-hover);
  border-radius: 10px;
}
.whm-scrollable-menu::-webkit-scrollbar {
  width: 6px;
}
.whm-scrollable-menu::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
.whm-scrollable-menu::-webkit-scrollbar-thumb {
  background-color: var(--border-hover);
  border-radius: 10px;
}


`;
