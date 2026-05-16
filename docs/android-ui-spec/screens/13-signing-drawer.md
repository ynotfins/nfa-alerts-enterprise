# 13 - Signing Drawer

## Screen purpose
Collect homeowner signature, confirm chaser signature, and complete signing of selected document(s).

## Role visibility
Responded Chasers and Supe/Admin.

## Screenshot references
`Details-Docs-Selected-Doc-Sign.jpg`, `Details-Respond-Docs.jpg`.

## Route/path
Bottom sheet state inside `/incidents/[id]/sign` and profile signature update sheet.

## Source files/components/hooks/services
- `apps/web/src/app/(dashboard)/incidents/[id]/sign/sign-client.tsx`
- `apps/web/src/app/(dashboard)/profile/profile-client.tsx`
- `react-signature-canvas`
- `apps/web/src/services/verification.ts`

## Data dependencies
Profile `signatureUrl`, selected document metadata, incident location, signed document write path.

## Realtime listeners
None inside drawer; parent page refreshes saved docs.

## Layout description from top to bottom
Dimmed backdrop with rounded top bottom sheet. Document signing drawer: title `Property Damage Assessment`, subtitle `Document 1 of 1`, close X, explanatory text card, `Homeowner Signature` label with `Clear`, dashed signature box, `Chaser Signature (Name)` read-only signature preview, agreement checkbox, blue `Complete Signing`, white `Cancel`. Profile signature drawer: title `Update Your Signature`, helper text, dashed signature box, blue `Save Signature`, white `Cancel`.

## Component hierarchy
Drawer -> header -> document body -> signature canvases/previews -> checkbox -> primary/secondary actions.

## Interaction inventory
- Draw homeowner signature.
- Clear canvas.
- Check agreement.
- Complete signing.
- Update profile signature from profile screen.

## Filters/search/sort controls
None.

## Buttons/actions and expected results
- `Complete Signing`: validates signatures/agreement and saves signed document.
- `Save Signature`: updates profile signature.
- `Cancel`: closes sheet.

## Navigation targets
Returns to sign or profile screen after close/save.

## Loading states
Signing action shows loading in source.

## Empty states
Empty dashed signature canvas.

## Error states
Toasts for missing signature/agreement/location/profile signature.

## Permission/role restrictions
Requires access to sign screen; profile signature update belongs to current user.

## Android UI reconstruction notes
Use `ModalBottomSheet` with custom signature composable and fixed action column. Preserve large empty drawing area and read-only chaser signature preview.

## Open questions / verification gaps
Need populated multi-document signing sequence screenshots.
