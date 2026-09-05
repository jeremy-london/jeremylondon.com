---
name: editorial-voice
description: Use this skill whenever writing, editing, rewriting, reviewing, or reformatting any blog post. It defines the required editorial voice, structural variety, writing style, and formatting principles for all blog content.
---

# Jeremy London Blog Editor

Use this skill when creating, rewriting, editing, or reviewing posts for `jeremylondon.com/blog`.

The goal is not to make AI-generated prose "sound human."

The goal is to produce a blog that feels like it belongs to one curious engineer while allowing individual posts to have radically different shapes, lengths, rhythms, purposes, and levels of polish.

Jeremy's blog should feel accumulated rather than manufactured.

Some posts should be careful technical essays. Some should be field notes. Some should document something that broke. Some should capture a single observation in 300 words. Some should contain almost nothing except a useful command and why it mattered. Some should disagree with conventional wisdom. Some should be experiments. Some should be long enough to become reference material.

Do not make every idea into an article.

---

## Core editorial philosophy

Jeremy writes as an engineer who builds things, operates systems, experiments with new technology, leads engineering work, and notices interesting details along the way.

The blog should capture that activity.

Prefer:

* concrete observations over abstract lessons
* things Jeremy actually encountered over invented scenarios
* evidence over rhetorical confidence
* curiosity over authority theater
* specific tools, commands, numbers, bugs, APIs, and systems over generic technology language
* opinions with reasons over neutral summaries
* useful fragments over unnecessarily complete essays
* showing the investigation over presenting a magically finished conclusion
* uncertainty when uncertainty actually exists
* technical depth when the subject earns it
* brevity when there is only one interesting thing to say

A post does not need to teach a universal lesson.

It is perfectly acceptable for a post to exist because:

> I tried this. Something interesting happened. Here is what I found.

---

## The most important rule: vary the shape

Never assume a blog post needs the standard structure:

1. introduction
2. context
3. several explanatory sections
4. implications
5. conclusion

This structure is currently overrepresented and should be actively avoided.

Before writing, determine the natural shape of the material.

The shape must emerge from the reason the post exists.

Do not force the material into a reusable template.

---

## Think in post shapes, not templates

The following are possible shapes, not mandatory formats.

Do not cycle mechanically through them.

Invent other shapes whenever the material suggests one.

### Tiny observation

Roughly 50-400 words.

One interesting thing.

It may have no headings at all.

Start directly with the observation.

Explain just enough context to make it useful.

Stop when the interesting part is over.

Do not inflate it into an essay.

---

### TIL

Document something Jeremy just learned.

Possible structure:

* what he was trying to do
* the command, setting, API, or technique
* the surprising part
* a working example

Often no conclusion is needed.

A command plus two paragraphs may be an entire post.

---

### Field note

Capture something Jeremy encountered while building or operating a system.

The chronology may matter more than conceptual organization.

For example:

I expected X.

Instead I saw Y.

I checked A.

That ruled out B.

Eventually the problem turned out to be C.

Here is the part worth remembering.

Preserve useful wrong turns.

---

### Build log

Start with the thing being built.

Show artifacts early:

* screenshots
* commands
* diagrams
* code
* traces
* output
* measurements

Explain decisions as they occur.

This can be chronological and somewhat messy.

It should feel like engineering work happened.

---

### Experiment

Begin with a question.

Describe the setup.

Show the result.

Then interpret it.

Do not pretend the experiment proves more than it does.

Unexpected or inconclusive results are worth publishing.

---

### Investigation

Begin with something confusing, broken, surprising, or unexplained.

Follow the evidence.

Allow hypotheses to be wrong.

The conclusion may be a diagnosis rather than a broad lesson.

---

### Opinion

State something Jeremy actually believes.

Explain why.

Use examples.

Acknowledge the strongest limitation or counterexample when relevant.

Do not manufacture opinions from source material.

If Jeremy's opinion is unknown, ask for it or frame the piece around evidence instead.

---

### Reaction

Start from an external event:

* release
* paper
* blog post
* announcement
* benchmark
* repository
* conversation
* product change

Link to the original thing quickly.

Then answer:

**What about this caught Jeremy's attention?**

Do not summarize the entire source unless necessary.

The reaction is the post.

---

### Quote + thought

Sometimes someone else already said the interesting thing.

Quote a short passage.

Explain why it stuck.

Connect it to something Jeremy has observed.

Stop.

Do not turn three paragraphs of insight into a seven-section essay.

---

### Code-first post

Open with code.

Then explain why the code exists.

Useful for:

* scripts
* SQL
* shell commands
* configuration
* debugging
* API examples
* infrastructure
* benchmarks

Let the artifact carry the post.

---

### Story

Start with a moment rather than a thesis.

Examples:

> I broke this for the third time on Thursday.

> I thought the migration was finished until I restarted the second container.

> Last week I found myself staring at a trace that made absolutely no sense.

Then tell the story.

Extract a broader lesson only if one genuinely exists.

---

### Deep technical walkthrough

Use when the material actually requires depth.

These may contain many headings.

Cover things such as:

* architecture
* implementation
* data flow
* tradeoffs
* failure modes
* performance
* security
* observability
* deployment
* lessons from production

The headings should describe the actual system, not generic essay stages.

Prefer:

`The request path`

`Where the cache sits`

`The race I missed`

`What happens during failover`

over:

`Understanding the architecture`

`Key considerations`

`Challenges and solutions`

`Looking ahead`

---

### Reference

Some posts exist primarily to become useful documentation Jeremy can find later.

Optimize these for retrieval rather than narrative.

Commands, examples, tables, configuration, caveats, and links can dominate.

Personality is secondary to usefulness.

---

### List

Lists are allowed when the subject genuinely is a collection.

They do not need:

* a long introduction
* equal-length entries
* a concluding synthesis

Interesting entries can be long.

Obvious ones can be one sentence.

---

### Question without a clean answer

Explore something Jeremy is thinking about.

It is acceptable to finish with unresolved questions.

Do not fabricate certainty just because articles traditionally end with conclusions.

---

## Start differently

Across the blog, openings should vary dramatically.

Do not repeatedly begin with:

> X is becoming increasingly important...

> The interesting thing about X is...

> X matters because...

> As AI systems become...

> There is a simple idea behind...

> Most teams...

These are generic essay openings.

Possible openings include:

#### Observation

> Claude Code has made me care about git status more than I did two years ago.

#### Result

> 37ms.

> That was the difference between the two paths, which was much smaller than I expected.

#### Problem

> I couldn't get the pod to talk to a VM sitting on the same physical machine.

#### Code

```bash
ip route get 10.10.10.2
```

#### Discovery

> I learned today that Postgres can do this without Redis.

#### Disagreement

> I don't think every AI request needs semantic caching.

#### Story

> I spent an embarrassing amount of time debugging the wrong network interface.

#### Question

> How much infrastructure should an AI gateway own?

#### External trigger

> Anthropic released X yesterday. One detail in the announcement matters much more to me than the headline feature.

#### Direct statement

> I like boring infrastructure.

#### Artifact

Show the screenshot, trace, code, table, diagram, or result first.

Then explain it.

Do not select an opening merely for novelty. Select the opening that exposes the reason the post exists fastest.

---

## End naturally

Do not automatically summarize the article.

Avoid conclusions that restate everything the reader just read.

Especially avoid:

> Ultimately...

> The key takeaway is...

> As we move forward...

> The future of...

> By embracing...

> What matters most is...

Possible endings include:

* the final result
* a command
* a surprising number
* the unresolved question
* the lesson Jeremy wants to remember
* a limitation
* what Jeremy is trying next
* a link
* a screenshot
* a short opinion
* the final event in the story

Or simply stop.

A post does not require ceremonial closure.

---

## Headings are optional

Do not add headings until the content needs navigation.

A 500-word post probably does not need four `##` sections.

A 200-word post almost certainly does not.

Long technical posts may need many.

When headings are useful, make them specific to the material.

Bad:

### The problem

### The solution

### Why it matters

### Key takeaways

### Conclusion

Better:

### The 429 wasn't coming from the model

### Moving retries outside the router

### The second failure was worse

Or simply use no headings.

---

## Destroy visual repetition

When reviewing several posts together, inspect their silhouettes.

Look for repeated:

* paragraph counts
* heading counts
* section lengths
* introduction lengths
* conclusion lengths
* title constructions
* code-block placement
* bullet-list placement
* rhetorical progression
* article length

If adjacent posts look structurally interchangeable, change them.

A reader scrolling the archive should encounter visibly different objects.

One post might be:

title
two paragraphs
code
one paragraph

Another:

title
long narrative
screenshot
three technical sections
table
short ending

Another:

title
quote
reaction

Another:

title
one paragraph

Another:

title
diagram
deep technical walkthrough

Variation should come from the material, not randomness for its own sake.

---

## Avoid suspiciously balanced prose

AI writing likes symmetry.

It frequently creates:

* three examples
* three reasons
* three implications
* three-item sentences
* sections of similar length
* repeated contrast structures
* neat rhetorical escalation

Do not optimize for symmetry.

If there are two important reasons, give two.

If there are seven, give seven.

If one deserves 500 words and another deserves one sentence, write them that way.

Unevenness is often evidence that the writing follows the information rather than a template.

---

## Stop turning everything into a framework

Avoid automatically converting observations into:

* principles
* pillars
* frameworks
* dimensions
* layers
* maturity models
* checklists
* taxonomies
* numbered rules

Use those structures only when Jeremy actually discovered something that benefits from them.

A useful observation can remain an observation.

---

## Preserve the fingerprints of real work

The strongest material in this blog should come from things that happened.

Preserve details such as:

* commands Jeremy ran
* errors he saw
* surprising output
* measurements
* model names
* hardware
* configuration
* library versions
* filenames
* architecture decisions
* abandoned approaches
* screenshots
* benchmarks
* pull requests
* commits
* logs
* traces
* conversations
* questions Jeremy asked himself
* things he originally misunderstood

Specificity is more valuable than artificially casual language.

Do not invent these details.

If they are unavailable and important, ask Jeremy for them.

---

## Jeremy's voice

Aim for a voice that is:

* technically confident without pretending omniscience
* curious
* pragmatic
* willing to have preferences
* willing to say "I don't know"
* interested in how systems behave in reality
* comfortable with technical detail
* skeptical of unnecessary complexity
* excited when technology does something genuinely interesting
* concise when the idea is small
* exhaustive when the subject deserves exhaustive treatment

Jeremy can say:

> I like this.

> I don't buy that argument.

> I expected this to be faster.

> This surprised me.

> I haven't figured this part out yet.

> I tried Redis first and regretted it.

> I keep coming back to this design.

But only when those statements reflect Jeremy's actual view or supplied experience.

Never invent first-person experiences, beliefs, emotions, or actions.

---

## Learn from Simon Willison without impersonating Simon Willison

Simon Willison's blog is a useful editorial reference because individual entries are allowed to be whatever size and shape the underlying idea deserves.

Borrow principles such as:

* publish small observations
* link directly to primary sources
* quote the interesting part and respond to it
* preserve experiments
* show code
* show results
* publish TILs
* write reactions instead of generic explainers
* use first person when it reflects actual experience
* allow posts to be extremely short
* update posts when new information arrives
* let chronology carry a story
* follow curiosity
* treat the blog as a working notebook as well as a publication

Do NOT imitate Simon's exact phrasing, sentence patterns, recurring expressions, jokes, or personal voice.

Jeremy's blog should not read like Simon Willison.

It should learn from the freedom of Simon's publishing model.

---

## AI language to aggressively edit

Watch for these patterns.

### Empty importance

> This is important because...

> This matters because...

> The implications are significant...

Show the consequence instead.

### Fake contrast

> It's not just X. It's Y.

> This isn't about X. It's about Y.

These constructions are occasionally useful but become obvious when repeated.

### Excessive negation

Jeremy's existing writing frequently explains an idea by saying what it is *not* before saying what it is.

Prefer saying the thing directly.

### Rhetorical fragments

AI often generates sequences such as:

> The model proposes.

> The application decides.

> The user approves.

> The system executes.

This can be effective once. Repetition across posts becomes a fingerprint.

### Grand final sentence

Do not manufacture a quotable final line for every post.

### Generic adjectives

Be suspicious of:

* robust
* seamless
* powerful
* comprehensive
* critical
* crucial
* transformative
* scalable
* sophisticated
* innovative

Use concrete descriptions instead.

### Meta-signposting

Remove unnecessary phrases such as:

> Let's break this down.

> There are several things worth considering.

> To understand why, we first need to...

> Let's take a closer look.

Usually just say the next thing.

---

## Titles

Titles should also vary.

Do not make every title a polished thesis.

Use different title behaviors.

Examples:

**Direct**

> Model routing is a systems problem

**Specific**

> Debugging k3s → VM traffic on a bridged TrueNAS host

**Discovery**

> TIL: Postgres advisory locks are surprisingly useful here

**Question**

> Do I actually need Redis for this?

**Result**

> I got Qwen running entirely in the browser

**Object**

> My AI gateway database schema

**Story**

> The retry handler that didn't retry

**Reaction**

> What I like about Claude's new tool API

**Tiny**

> 37ms

**Personal**

> What running an AI team changed about how I prototype

Do not optimize every title for SEO at the expense of sounding like something a person decided to write.

---

## Length

Never target a standard article length.

Use approximately:

* 50-250 words for fragments and tiny discoveries
* 250-700 words for notes and reactions
* 600-1,500 words for normal technical posts
* 1,500-3,500 words for substantial investigations
* 3,000+ words when creating a genuine reference or deep dive

These are permissions, not quotas.

The correct length is:

**the amount of writing required to preserve the interesting information.**

Stop after that.

---

## Source behavior

For posts about external technology:

Prefer primary sources.

Link to:

* documentation
* repositories
* commits
* release notes
* papers
* issue threads
* benchmarks
* original announcements

Do not hide sources at the bottom solely to preserve essay flow.

A hyperlink in the first paragraph is often exactly where it belongs.

Distinguish clearly between:

* what the source says
* what Jeremy observed
* what Jeremy infers
* what Jeremy believes

Never blur these together.

---

## Evidence before explanation

Whenever possible, show the interesting artifact before explaining it.

Instead of:

> During testing I discovered that the latency was significantly lower...

Prefer:

```text
local:  38ms
remote: 121ms
```

Then explain why.

Instead of describing an error for four paragraphs, show the error.

Instead of describing an architecture that is hard to visualize, show the diagram.

Instead of saying a UI changed, show the screenshot if available.

---

## Do not manufacture humanity

Never deliberately add:

* fake typos
* fake uncertainty
* fake anecdotes
* fake frustration
