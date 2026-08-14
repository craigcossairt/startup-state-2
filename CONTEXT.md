# Startup State 2

Government Opportunity Finder for the GOED bounty at AI Builder Day Part 2. A founder describes a company and gets federal and state resources they should know about, with a why. New app, Startup State skin. Quality bar: could go live on startup.utah.gov tomorrow. Must not conflict with the Part 2 brief.

## Language

**Opportunity Map**:
The product. Ranked-by-fit cards for a company: program, agency, value, deadline, why, concerns, similar awardees, next step. Not a geographic map. Not a determination that the company is eligible.
_Avoid_: grant search, Navigator, Playbook, startup map, eligible

**Intake**:
One sentence or a fixture click, then infer, then only the missing Company profile fields, then the Opportunity Map.
_Avoid_: long form first, chat-only capture, Persona bar

**Company profile**:
The structured description used to match. Schema: `docs/spec/company-profile-schema.md`. Must-have: what they do, technologies, sectors, country, state, employees, revenue (point + basis), capital raised, capital need (range), use of funds. Infer-if-present: city, stage, R&D, product maturity, customers. Every field uses `known` / `inferred` / `missing`; confirm screen before map when infer fills must-haves.
_Avoid_: Persona

**Federal lane**:
Required core. Open list is Grants.gov. SAM Assistance Listings (cache) join onto those cards by ALN. USAspending and the SBIR award CSV attach similar awardees. They are not a second open-opportunity list.
_Avoid_: every agency, the full federal government, treating SAM or USAspending as live NOFOs

**State lane**:
Local programs for a Jurisdiction. There is no official Utah opportunity API. This demo uses the Part 1 GOEO table (up to the full 213) with categorization and filtering, plus any curated official program cards we lock. A company outside Utah can still match a Utah program when the program allows it; most will not.
_Avoid_: Utah lane, Playbook, dumping the whole catalog unfiltered, inventing a Utah Grants.gov

**Jurisdiction**:
The state or municipality whose local programs sit in the State lane. This demo: Utah.
_Avoid_: treating "Utah" as the only possible State lane

**Source badge**:
Federal, or State named by Jurisdiction (Utah on this demo).
_Avoid_: Utah-only as the product category

**Fit label**:
likely / potential-verify / adjacent / probably not. The only ranking language in the product. Never “eligible.”
_Avoid_: eligible, eligibility determination

**Retrieve**:
Per-source adapters that turn a Company profile into a capped ID set from official catalogs and the GOEO table. Rank may only emit retrieved IDs.
_Avoid_: keyword-only search as the product, LLM-invented programs, topic-weight matching

**Probably-not floor**:
When rank finds no Federal `likely` or `potential-verify`, and at least one Utah card is still a real Fit, the Opportunity Map leads with an honest federal poor-fit banner plus the State lane. Federal `probably not` cards stay visible.
_Avoid_: hiding federal rows, hallucinating a strong grant for fixture-5

**Chip**:
A control that widens retrieve (lane, extra GOEO keys, `directory`) and re-ranks, or filters the ranked list by Fit. Default map is the first retrieved slice, not all 213.
_Avoid_: dumping the catalog, using source `Funding` as a retrieve key

**Fixture**:
One of the five official test companies in the brief. Case 5 may have no strong federal grant.
_Avoid_: Jordan/Maria/Marcus/Priya/David/Amir (those were Part 1)

**Nucleus**:
GOEO’s current SBIR/STTR help desk. Part 1 catalog name: Utah Innovation Center.
_Avoid_: treating campus “Innovation Centers” as this program

**Part 1 app**:
craigcossairt/startup-state. Anything that does not conflict with the Part 2 brief may be copied, including extras that show future vision. Conflicts: Playbook or a geo map as the product, last year's six personas as the judged set, topic-weight matching as the ranker, inventing programs.
_Avoid_: treating the five-surface app as this product
