--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7
-- Dumped by pg_dump version 15.2

-- Started on 2023-04-21 16:36:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 16777)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO avnadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16767)
-- Name: comments; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.comments (
    comment_id integer NOT NULL,
    author_id integer NOT NULL,
    post_id integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO avnadmin;

--
-- TOC entry 213 (class 1259 OID 16766)
-- Name: comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_comment_id_seq OWNER TO avnadmin;

--
-- TOC entry 4414 (class 0 OID 0)
-- Dependencies: 213
-- Name: comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.comments_comment_id_seq OWNED BY public.comments.comment_id;


--
-- TOC entry 216 (class 1259 OID 16782)
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.direct_messages (
    message_id integer NOT NULL,
    sender_id integer,
    recipient_id integer,
    message text,
    sent_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.direct_messages OWNER TO avnadmin;

--
-- TOC entry 215 (class 1259 OID 16781)
-- Name: direct_messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.direct_messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.direct_messages_message_id_seq OWNER TO avnadmin;

--
-- TOC entry 4415 (class 0 OID 0)
-- Dependencies: 215
-- Name: direct_messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.direct_messages_message_id_seq OWNED BY public.direct_messages.message_id;


--
-- TOC entry 212 (class 1259 OID 16726)
-- Name: posts; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying(255),
    date timestamp without time zone DEFAULT now() NOT NULL,
    description text NOT NULL,
    attachment text,
    tags character varying(255),
    author_id integer NOT NULL
);


ALTER TABLE public.posts OWNER TO avnadmin;

--
-- TOC entry 211 (class 1259 OID 16725)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO avnadmin;

--
-- TOC entry 4416 (class 0 OID 0)
-- Dependencies: 211
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 218 (class 1259 OID 16804)
-- Name: reactions; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.reactions (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    emoji character varying(255) NOT NULL
);


ALTER TABLE public.reactions OWNER TO avnadmin;

--
-- TOC entry 217 (class 1259 OID 16803)
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reactions_id_seq OWNER TO avnadmin;

--
-- TOC entry 4417 (class 0 OID 0)
-- Dependencies: 217
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- TOC entry 220 (class 1259 OID 16814)
-- Name: shared_posts; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.shared_posts (
    id integer NOT NULL,
    user_id integer,
    post_id integer,
    shared_date timestamp without time zone
);


ALTER TABLE public.shared_posts OWNER TO avnadmin;

--
-- TOC entry 219 (class 1259 OID 16813)
-- Name: shared_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.shared_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shared_posts_id_seq OWNER TO avnadmin;

--
-- TOC entry 4418 (class 0 OID 0)
-- Dependencies: 219
-- Name: shared_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.shared_posts_id_seq OWNED BY public.shared_posts.id;


--
-- TOC entry 221 (class 1259 OID 16832)
-- Name: unread_messages; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.unread_messages (
    user_id integer NOT NULL,
    message_id integer NOT NULL
);


ALTER TABLE public.unread_messages OWNER TO avnadmin;

--
-- TOC entry 222 (class 1259 OID 16838)
-- Name: user_followers; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.user_followers (
    follower_id integer NOT NULL,
    following_id integer NOT NULL
);


ALTER TABLE public.user_followers OWNER TO avnadmin;

--
-- TOC entry 210 (class 1259 OID 16690)
-- Name: users; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    fname character varying(255) NOT NULL,
    lname character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    profile_picture_url character varying(255) NOT NULL,
    user_description text,
    role_id integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    email_verification_token character varying(255)
);


ALTER TABLE public.users OWNER TO avnadmin;

--
-- TOC entry 209 (class 1259 OID 16689)
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: avnadmin
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_userid_seq OWNER TO avnadmin;

--
-- TOC entry 4419 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: avnadmin
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.user_id;


--
-- TOC entry 4212 (class 2604 OID 16770)
-- Name: comments comment_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comments ALTER COLUMN comment_id SET DEFAULT nextval('public.comments_comment_id_seq'::regclass);


--
-- TOC entry 4215 (class 2604 OID 16785)
-- Name: direct_messages message_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.direct_messages ALTER COLUMN message_id SET DEFAULT nextval('public.direct_messages_message_id_seq'::regclass);


--
-- TOC entry 4210 (class 2604 OID 16729)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 4217 (class 2604 OID 16807)
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- TOC entry 4218 (class 2604 OID 16817)
-- Name: shared_posts id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.shared_posts ALTER COLUMN id SET DEFAULT nextval('public.shared_posts_id_seq'::regclass);


--
-- TOC entry 4206 (class 2604 OID 16693)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- TOC entry 4399 (class 0 OID 16767)
-- Dependencies: 214
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.comments (comment_id, author_id, post_id, comment, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4401 (class 0 OID 16782)
-- Dependencies: 216
-- Data for Name: direct_messages; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.direct_messages (message_id, sender_id, recipient_id, message, sent_date) FROM stdin;
\.


--
-- TOC entry 4397 (class 0 OID 16726)
-- Dependencies: 212
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.posts (id, title, date, description, attachment, tags, author_id) FROM stdin;
5	Bienvenue 	2023-04-18 14:02:14.288361	ça marche ça y est?	[]	["test"]	1
\.


--
-- TOC entry 4403 (class 0 OID 16804)
-- Dependencies: 218
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.reactions (id, post_id, user_id, emoji) FROM stdin;
\.


--
-- TOC entry 4405 (class 0 OID 16814)
-- Dependencies: 220
-- Data for Name: shared_posts; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.shared_posts (id, user_id, post_id, shared_date) FROM stdin;
\.


--
-- TOC entry 4406 (class 0 OID 16832)
-- Dependencies: 221
-- Data for Name: unread_messages; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.unread_messages (user_id, message_id) FROM stdin;
\.


--
-- TOC entry 4407 (class 0 OID 16838)
-- Dependencies: 222
-- Data for Name: user_followers; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.user_followers (follower_id, following_id) FROM stdin;
4	1
8	1
\.


--
-- TOC entry 4395 (class 0 OID 16690)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (user_id, username, display_name, fname, lname, email, password, profile_picture_url, user_description, role_id, created_at, updated_at, email_verification_token) FROM stdin;
1	spart	Spart	Jonathan	Binot	spart@ikmail.com	$2b$10$BulQWMdsejQEEojc.ICSkefAKKo8.jTugiTao5LT81gp.SZDCJXUS	/uploads/users/profile-pictures/1681809866778-SpartFR.png	\N	0	2023-04-18 09:24:25.84561+00	2023-04-18 09:24:25.84561+00	\N
4	tsuktsuk	TsukiyoPower	Tsukiyo	Power	spartan6914@gmail.com	$2b$10$5ZoBTe56bJyWGY.sKvR/UeQMO7kHr9nHVK9iFpBx0R7WrYkYiIf7m	/uploads/users/profile-pictures/1681908271853-UShGaa8i.jpg	\N	0	2023-04-19 12:44:30.48027+00	2023-04-19 12:44:30.48027+00	\N
8	ogloc	OGLoc	OG	Loc	jonathan.binot@gmail.com	$2b$10$ALpPu7wFY9xfb9Mcj2DrhetcHMVftVsXAhSBynQf1egDAHA.V0L.S	/images/ProfileDefault.png	Yo man	0	2023-04-19 14:59:04.574188+00	2023-04-19 14:59:04.574188+00	\N
\.


--
-- TOC entry 4420 (class 0 OID 0)
-- Dependencies: 213
-- Name: comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.comments_comment_id_seq', 1, false);


--
-- TOC entry 4421 (class 0 OID 0)
-- Dependencies: 215
-- Name: direct_messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.direct_messages_message_id_seq', 1, false);


--
-- TOC entry 4422 (class 0 OID 0)
-- Dependencies: 211
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.posts_id_seq', 5, true);


--
-- TOC entry 4423 (class 0 OID 0)
-- Dependencies: 217
-- Name: reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.reactions_id_seq', 1, false);


--
-- TOC entry 4424 (class 0 OID 0)
-- Dependencies: 219
-- Name: shared_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.shared_posts_id_seq', 1, false);


--
-- TOC entry 4425 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: avnadmin
--

SELECT pg_catalog.setval('public.users_userid_seq', 10, true);


--
-- TOC entry 4228 (class 2606 OID 16776)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (comment_id);


--
-- TOC entry 4232 (class 2606 OID 16790)
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (message_id);


--
-- TOC entry 4226 (class 2606 OID 16734)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4236 (class 2606 OID 16809)
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4240 (class 2606 OID 16819)
-- Name: shared_posts shared_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.shared_posts
    ADD CONSTRAINT shared_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4220 (class 2606 OID 16704)
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 4222 (class 2606 OID 16702)
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 4245 (class 2606 OID 16836)
-- Name: unread_messages unread_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.unread_messages
    ADD CONSTRAINT unread_messages_pkey PRIMARY KEY (user_id, message_id);


--
-- TOC entry 4248 (class 2606 OID 16842)
-- Name: user_followers user_followers_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.user_followers
    ADD CONSTRAINT user_followers_pkey PRIMARY KEY (follower_id, following_id);


--
-- TOC entry 4224 (class 2606 OID 16700)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4233 (class 1259 OID 16802)
-- Name: direct_messages_recipient_id_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX direct_messages_recipient_id_idx ON public.direct_messages USING btree (recipient_id);


--
-- TOC entry 4234 (class 1259 OID 16801)
-- Name: direct_messages_sender_id_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX direct_messages_sender_id_idx ON public.direct_messages USING btree (sender_id);


--
-- TOC entry 4229 (class 1259 OID 16778)
-- Name: idx_author_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 4230 (class 1259 OID 16779)
-- Name: idx_post_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_post_id ON public.comments USING btree (post_id);


--
-- TOC entry 4243 (class 1259 OID 16837)
-- Name: idx_unread_messages_message_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_unread_messages_message_id ON public.unread_messages USING btree (message_id);


--
-- TOC entry 4237 (class 1259 OID 16810)
-- Name: reactions_postid_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX reactions_postid_idx ON public.reactions USING btree (post_id);


--
-- TOC entry 4238 (class 1259 OID 16811)
-- Name: reactions_userid_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX reactions_userid_idx ON public.reactions USING btree (user_id);


--
-- TOC entry 4241 (class 1259 OID 16831)
-- Name: shared_posts_post_id_index; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX shared_posts_post_id_index ON public.shared_posts USING btree (post_id);


--
-- TOC entry 4242 (class 1259 OID 16830)
-- Name: shared_posts_user_id_index; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX shared_posts_user_id_index ON public.shared_posts USING btree (user_id);


--
-- TOC entry 4246 (class 1259 OID 16843)
-- Name: user_followers_followed_id_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX user_followers_followed_id_idx ON public.user_followers USING btree (following_id);


--
-- TOC entry 4254 (class 2620 OID 16780)
-- Name: comments update_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4250 (class 2606 OID 16796)
-- Name: direct_messages direct_messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id);


--
-- TOC entry 4251 (class 2606 OID 16791)
-- Name: direct_messages direct_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- TOC entry 4249 (class 2606 OID 16735)
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(user_id);


--
-- TOC entry 4252 (class 2606 OID 16825)
-- Name: shared_posts shared_posts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.shared_posts
    ADD CONSTRAINT shared_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- TOC entry 4253 (class 2606 OID 16820)
-- Name: shared_posts shared_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.shared_posts
    ADD CONSTRAINT shared_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4413 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2023-04-21 16:36:02

--
-- PostgreSQL database dump complete
--

