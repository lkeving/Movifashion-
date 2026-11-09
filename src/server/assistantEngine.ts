// Intelligent Conversational Assistant Engine (Movi)
// Multi-turn Gemini 3.8 Flash + Deep Rule-Based Deterministic Fallback with Session Memory
// MoviFashion AI — Colombia

import { GoogleGenAI } from '@google/genai';
import { Product, Order } from '../types/index.ts';
import { EMPRESA } from '../config/empresa.ts';
import { BASE_CONOCIMIENTO, buscarEnBaseConocimiento } from '../data/conocimiento.ts';
import { formatCOP } from '../utils/impuestos.ts';

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
  recommendedProductIds?: string[];
}

export interface AssistantResult {
  reply: string;
  productIds: string[];
  suggestions: string[];
  intent: string;
  resolved: boolean;
}

// ---------------------------------------------------------------------
// VARIANT POOLS FOR ANTI-REPETITION GUARANTEE
// ---------------------------------------------------------------------
const SALUDOS = [
  `¡Hola! Qué gusto saludarte. Soy Movi, tu asesor virtual de estilo en ${EMPRESA.nombreComercial}. ¿En qué te puedo colaborar hoy? Puedo recomendarte prendas de nuestra nueva colección, orientarte con tallas o ayudarte con envíos y pagos.`,
  `¡Hola! Bienvenido a ${EMPRESA.nombreComercial}. Soy Movi, tu estilista personal. Cuéntame, ¿estás buscando un look casual, algo formal para la oficina, o deseas consultar sobre tus pedidos?`,
  `¡Qué tal! Es un placer atenderte hoy en ${EMPRESA.nombreComercial}. Me llamo Movi y estoy listo para ayudarte a encontrar las mejores combinaciones y responder cualquier duda de compra.`,
];

const DESPEDIDAS = [
  `¡Ha sido un verdadero placer ayudarte! Si necesitas algo más adelante, aquí estaré listo para asesorarte. ¡Que tengas un excelente día!`,
  `¡Hasta pronto! Recuerda que en ${EMPRESA.nombreComercial} despachamos a toda Colombia con envío gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)}. ¡Vuelve cuando quieras!`,
  `¡Con gusto! Estaré por aquí siempre que desees renovar tu estilo o verificar novedades en nuestra tienda. ¡Feliz día!`,
];

const AGRADECIMIENTOS = [
  `¡Con todo el gusto del mundo! En ${EMPRESA.nombreComercial} nos apasiona brindarte la mejor atención. ¿Hay alguna otra prenda o duda en la que pueda apoyarte?`,
  `¡Para servirte siempre! Me alegra haberte sido útil. Recuerda que puedes explorar nuestra [Nueva Colección](/nueva-coleccion) o revisar [Tendencias](/tendencias) en cualquier momento.`,
  `¡Es todo un placer! Quedo muy atento si deseas verificar detalles de tallas, opciones de pago o seguimiento de pedidos.`,
];

/**
 * Ensures a generated response is not identical to the assistant's previous message.
 */
function avoidExactRepetition(newReply: string, lastAssistantText?: string, fallbackVariants: string[] = []): string {
  if (!lastAssistantText) return newReply;
  const cleanNew = newReply.trim().toLowerCase();
  const cleanOld = lastAssistantText.trim().toLowerCase();
  if (cleanNew !== cleanOld) return newReply;

  // Find an alternative that is not identical
  const alt = fallbackVariants.find(v => v.trim().toLowerCase() !== cleanOld);
  if (alt) return alt;

  return `${newReply} Recuerda que también puedo resolver preguntas sobre envíos, medios de pago o ayudarte a combinar tu outfit.`;
}

/**
 * Main Assistant Query Processor
 */
export async function processAssistantChat(params: {
  message: string;
  history: ChatHistoryTurn[];
  catalog: Product[];
  orders: Order[];
  pqrsList: any[];
  currentUser?: { id: string; name: string; email: string; role?: string } | null;
  aiClient: GoogleGenAI | null;
}): Promise<AssistantResult> {
  const { message, history, catalog, orders, pqrsList, currentUser, aiClient } = params;
  const sanitized = message.trim().slice(0, 500);
  const lower = sanitized.toLowerCase().replace(/^[¡¿\s]+/, '');

  // Find the last assistant message from history for anti-repetition check
  const assistantHistory = history.filter(h => h.role === 'model');
  const lastAssistantTurn = assistantHistory.length > 0 ? assistantHistory[assistantHistory.length - 1] : null;
  const lastAssistantText = lastAssistantTurn?.text || '';
  const lastProductIds: string[] = lastAssistantTurn?.recommendedProductIds || [];
  const lastProducts = catalog.filter(p => lastProductIds.includes(p.id));

  // 1. Anti-Injection & Safety Guard
  const suspiciousPatterns = [/ignore previous instructions/i, /drop table/i, /select \* from/i, /system prompt/i, /<script/i];
  if (suspiciousPatterns.some(pat => pat.test(sanitized))) {
    return {
      reply: 'Como asesor de estilo de MoviFashion, mi función es orientarte exclusivamente en la selección de prendas de moda, calzado y accesorios de nuestro catálogo. ¿Qué estilo o prenda te gustaría conocer hoy?',
      productIds: [],
      suggestions: ['Ver nueva colección', 'Zapatos urbanos', '¿Cómo son los envíos?'],
      intent: 'seguridad_prompt',
      resolved: false,
    };
  }

  // 2. Explicit PQRS Radicado check
  const pqrsMatch = sanitized.match(/PQRS-[0-9]{4}-[0-9]{6}/i);
  if (pqrsMatch) {
    const radicadoTarget = pqrsMatch[0].toUpperCase();
    const foundPqrs = pqrsList.find(p => p.radicado.toUpperCase() === radicadoTarget);
    if (foundPqrs) {
      return {
        reply: `He consultado tu solicitud oficial **${foundPqrs.radicado}** (${foundPqrs.type.toUpperCase()}).\n- **Estado actual**: ${foundPqrs.status.toUpperCase()}.\n- **Asunto**: "${foundPqrs.subject}".\n- **Término legal de respuesta**: ${foundPqrs.responseDeadline}.\n${foundPqrs.responseMessage ? `- **Respuesta emitida**: "${foundPqrs.responseMessage}"` : '- Nuestro equipo de atención al cliente está revisando tu caso dentro de los términos de ley.'}`,
        productIds: [],
        suggestions: ['Radicar otra PQRS', 'Hablar por WhatsApp', 'Ver catálogo'],
        intent: 'pqrs_consulta',
        resolved: true,
      };
    } else {
      return {
        reply: `No encontré un radicado registrado con el código **${radicadoTarget}**. Por favor verifica el número o puedes radicar una nueva solicitud en nuestro módulo de [PQRS](/pqrs) o contactarnos directamente por [WhatsApp](${EMPRESA.redesSociales.facebook}).`,
        productIds: [],
        suggestions: ['Radicar PQRS', 'Preguntas frecuentes', 'Hablar con soporte'],
        intent: 'pqrs_no_encontrado',
        resolved: false,
      };
    }
  }

  // 3. Explicit Order check
  const orderMatch = sanitized.match(/ORD-[0-9]{4,6}/i);
  if (orderMatch) {
    const orderIdTarget = orderMatch[0].toUpperCase();
    const foundOrder = orders.find(o => o.id.toUpperCase() === orderIdTarget);
    if (foundOrder) {
      const isOwner = !currentUser || currentUser.role === 'admin' || foundOrder.userId === currentUser.id || foundOrder.userEmail.toLowerCase() === currentUser.email.toLowerCase();
      if (isOwner) {
        const orderItems = foundOrder.items.slice(0, 3).map(i => i.product || catalog.find(p => p.id === (i as any).productId)).filter(Boolean) as Product[];
        return {
          reply: `Encontré la información de tu pedido **${foundOrder.id}**:\n- **Estado**: ${foundOrder.status}.\n- **Número de guía**: ${foundOrder.trackingNumber} (transportadora nacional).\n- **Total cancelado**: ${formatCOP(foundOrder.total)} (IVA incluido).\n- **Prendas**: ${foundOrder.items.length} artículo(s).\n${foundOrder.status === 'Pendiente' ? 'Tu paquete está siendo alistado en nuestra bodega de Bogotá D.C.' : 'El paquete se encuentra en tránsito seguro hacia tu dirección registrada.'}`,
          productIds: orderItems.map(p => p.id),
          suggestions: ['¿Cómo son los cambios?', '¿Cómo devuelvo una prenda?', 'Ver más productos'],
          intent: 'orden_consulta',
          resolved: true,
        };
      }
    }
  }

  // 4. Logged-in Customer asking for their latest order
  if (currentUser && /mi pedido|mis pedidos|mi orden|dónde está mi|cuándo llega mi/i.test(lower)) {
    const userOrders = orders.filter(o => o.userId === currentUser.id || o.userEmail.toLowerCase() === currentUser.email.toLowerCase());
    if (userOrders.length > 0) {
      const latest = userOrders[0];
      const items = latest.items.slice(0, 2).map(i => i.product || catalog.find(p => p.id === (i as any).productId)).filter(Boolean) as Product[];
      return {
        reply: `Hola ${currentUser.name.split(' ')[0]}, tu pedido más reciente es el **${latest.id}** del ${new Date(latest.createdAt).toLocaleDateString('es-CO')}.\n- **Estado**: ${latest.status}\n- **Guía de transporte**: ${latest.trackingNumber}\n- **Total**: ${formatCOP(latest.total)} (${latest.items.length} prenda(s)).\n¿Deseas gestionar una novedad o consultar las políticas de entrega?`,
        productIds: items.map(p => p.id),
        suggestions: ['¿Cómo son los cambios?', 'Tiempos de entrega', 'Ver nueva colección'],
        intent: 'mis_pedidos',
        resolved: true,
      };
    }
  }

  // 5. Scored Catalog Candidates
  const budgetMatch = sanitized.match(/\$?\s*([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,7})/);
  const extractedBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/\./g, ''), 10) : null;

  const scoredCandidates = catalog
    .filter(p => p.inventory > 0)
    .map(p => {
      let score = 0;
      const finalPrice = p.discountPrice || p.price;
      if (extractedBudget && finalPrice <= extractedBudget) score += 40;
      if (extractedBudget && finalPrice > extractedBudget) score -= 30;

      if (lower.includes(p.category.toLowerCase())) score += 35;
      if (lower.includes(p.brand.toLowerCase())) score += 20;
      if (p.tags.some(t => lower.includes(t.toLowerCase()))) score += 25;
      if (p.colors.some(c => lower.includes(c.name.toLowerCase()))) score += 20;

      // Category semantic hints
      if (/tenis|zapatos|calzado|sneakers|deportivos/i.test(lower) && p.category === 'Zapatos') score += 40;
      if (/chaqueta|blazer|abrigo|gabán/i.test(lower) && p.category === 'Chaquetas') score += 40;
      if (/bolso|tote|morral|cartera/i.test(lower) && p.category === 'Bolsos') score += 40;
      if (/deporte|deportiva|entrenar|gym|leggings/i.test(lower) && p.category === 'Ropa deportiva') score += 40;
      if (/camisa|camiseta|t-shirt|polo|henley/i.test(lower) && p.category === 'Camisetas') score += 40;
      if (/vestido|gala|formal|noche/i.test(lower) && p.category === 'Vestidos') score += 40;
      if (/pantalon|pantalón|cargo|jogger|jean/i.test(lower) && p.category === 'Pantalones') score += 40;
      if (/accesorio|gafas|billetera|cinturón|reloj/i.test(lower) && p.category === 'Accesorios') score += 40;

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  // Relevant Knowledge Base Articles
  const articulosRelevantes = buscarEnBaseConocimiento(sanitized, 2);
  const knowledgeSnippet = articulosRelevantes.map(a => `[TEMA: ${a.titulo}]: ${a.contenido}`).join('\n\n');

  // 6. Attempt Gemini Generation with Multi-Turn History
  if (aiClient) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const systemInstruction = `Eres Movi, el estilista y asesor de compras virtual de MoviFashion ("Tu estilo, inteligentemente conectado") en Colombia.
Tu tono es cálido, respetuoso, profesional y con la cortesía característica colombiana ("Con mucho gusto...", "Claro que sí...", "Te cuento que en MoviFashion...").

REGLAS DE RESPUESTA:
1. Responde DIRECTAMENTE lo que el cliente pregunta.
2. Si falta información para una recomendación de moda (ej: ocasión, talla, presupuesto, color preferido), haz exactamente UNA pregunta aclaratoria amable.
3. Si el usuario hace seguimiento sobre productos anteriores ("¿y en azul?", "¿cuánto cuesta el segundo?", "¿tiene talla M?"), responde tomando como referencia las prendas recomendadas en el turno previo.
4. Si la pregunta es sobre envíos, pagos, cambios (30 días), retracto (5 días hábiles Ley 1480), garantías (90 días), tallas o contacto, apóyate con precisión en la BASE DE CONOCIMIENTO suministrada.
5. Puedes incluir enlaces Markdown cuando aplique: [Nueva Colección](/nueva-coleccion), [Tendencias](/tendencias), [Descuentos](/descuentos), [PQRS](/pqrs), o WhatsApp de atención.
6. Todos los precios de los productos tienen IVA del 19% incluido en Colombia. El envío es GRATIS por compras superiores a $200.000 COP.
7. Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "reply": "Tu respuesta conversacional...",
  "productIds": ["id1", "id2"],
  "suggestions": ["Sugerencia corta 1", "Sugerencia corta 2", "Sugerencia corta 3"]
}
El arreglo "suggestions" debe tener máximo 3 frases breves (menos de 6 palabras cada una) como botones de respuesta rápida para el usuario.
Si la consulta no requiere mostrar prendas, devuelve "productIds": [].`;

      // Build multi-turn contents (last 10 messages)
      const recentHistoryTurns = history.slice(-10);
      const contentsPayload: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      for (const turn of recentHistoryTurns) {
        contentsPayload.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }

      // Append current turn enriched with context
      const currentEnrichedPrompt = `Base de Conocimiento de MoviFashion Colombia:\n${knowledgeSnippet || 'Envíos a toda Colombia, gratis desde $200.000. Pagos con tarjeta, PSE y contraentrega. Cambios en 30 días.'}\n\nCatálogo Relevante disponible:\n${JSON.stringify(
        scoredCandidates.slice(0, 6).map(c => ({
          id: c.product.id,
          name: c.product.name,
          category: c.product.category,
          price: c.product.discountPrice || c.product.price,
          brand: c.product.brand,
          colors: c.product.colors.map(col => col.name),
          sizes: c.product.sizes,
          inventory: c.product.inventory,
        })),
        null,
        2
      )}\n\nÚltimos productos recomendados en el turno anterior:\n${JSON.stringify(
        lastProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.discountPrice || p.price,
          colors: p.colors.map(c => c.name),
          sizes: p.sizes,
        }))
      )}\n\nMensaje actual del cliente: "${sanitized}"`;

      contentsPayload.push({
        role: 'user',
        parts: [{ text: currentEnrichedPrompt }],
      });

      const generatePromise = aiClient.models.generateContent({
        model: modelName,
        contents: contentsPayload,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de respuesta Gemini (5s)')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const raw = response.text || '{}';
      const parsed = JSON.parse(raw);

      if (parsed.reply && typeof parsed.reply === 'string') {
        const validatedProductIds = Array.isArray(parsed.productIds)
          ? parsed.productIds.filter((pid: string) => catalog.some(p => p.id === pid)).slice(0, 4)
          : [];

        const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions.slice(0, 3).map((s: any) => String(s).slice(0, 35))
          : ['Ver nueva colección', '¿Cómo son los envíos?', 'Preguntas frecuentes'];

        const finalReply = avoidExactRepetition(parsed.reply, lastAssistantText, [
          `Con mucho gusto te complemento: ${parsed.reply}`,
          `${parsed.reply} ¿Te gustaría que te sugiera cómo combinar esta prenda?`,
        ]);

        return {
          reply: finalReply,
          productIds: validatedProductIds,
          suggestions,
          intent: 'gemini_conversacional',
          resolved: true,
        };
      }
    } catch (err: any) {
      console.error('[GEMINI CHAT ERROR]', err.code || err.status || 'UNKNOWN_CODE', err.message || err);
      // Fall through to deterministic rule-based engine
    }
  }

  // ---------------------------------------------------------------------
  // 7. DETERMINISTIC RULE-BASED INTENT ENGINE (FALLBACK & ZERO-REPETITION)
  // ---------------------------------------------------------------------

  // A. Saludos
  if (/^(hola|buenos d[ií]as|buenas tardes|buenas noches|buenas|hey|qu[eé] tal|saludos|holis)/i.test(lower)) {
    const reply = avoidExactRepetition(SALUDOS[0], lastAssistantText, SALUDOS);
    return {
      reply,
      productIds: [],
      suggestions: ['Ver nueva colección', 'Zapatos urbanos', '¿Cómo son los envíos?'],
      intent: 'saludo',
      resolved: true,
    };
  }

  // B. Despedidas
  if (/(adi[oó]s|chao|hasta luego|nos vemos|hasta pronto|que est[eé]s bien|chao chao)/i.test(lower)) {
    const reply = avoidExactRepetition(DESPEDIDAS[0], lastAssistantText, DESPEDIDAS);
    return {
      reply,
      productIds: [],
      suggestions: ['Ver catálogo completo', 'Ir a la tienda', 'Hablar por WhatsApp'],
      intent: 'despedida',
      resolved: true,
    };
  }

  // C. Agradecimientos
  if (/(gracias|muchas gracias|mil gracias|te agradezco|agradecido|muy amable)/i.test(lower)) {
    const reply = avoidExactRepetition(AGRADECIMIENTOS[0], lastAssistantText, AGRADECIMIENTOS);
    return {
      reply,
      productIds: [],
      suggestions: ['Ver tendencias', 'Ofertas y descuentos', 'Guía de tallas'],
      intent: 'agradecimiento',
      resolved: true,
    };
  }

  // D. Estado de Pedido y Rastreo
  if (/(estado.*(pedido|orden|compra)|rastre(o|ar)|n[uú]mero.*gu[ií]a|d[oó]nde viene|mi paquete|gu[ií]a de despacho)/i.test(lower)) {
    const replyVariants = [
      `Para consultar el estado de tu pedido o el número de guía de Coordinadora o Servientrega, puedes ingresar a tu sección de [Mis Pedidos](/mis-pedidos). También puedes escribirnos a nuestro WhatsApp ${EMPRESA.whatsapp} indicando tu número de orden (ej: ORD-2026-001) y te informaremos en tiempo real.`,
      `Despachamos todas las órdenes desde Bogotá D.C. con número de guía rastreable. Si ya realizaste una compra, puedes revisar el seguimiento detallado en [Mis Pedidos](/mis-pedidos) o contactarnos por WhatsApp con tu número de factura.`,
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ['Ver mis pedidos', 'Hablar por WhatsApp', 'Tiempos de entrega'],
      intent: 'estado_pedido',
      resolved: true,
    };
  }

  // E. Envíos y Tiempos de Entrega
  if (/env[ií]o|flete|despacho|cu[aá]nto tarda|demora|transportadora|coordinadora|servientrega|cu[aá]ndo llega/i.test(lower)) {
    const replyVariants = [
      `En **${EMPRESA.nombreComercial}** despachamos a toda Colombia a través de Coordinadora y Servientrega. El envío es **GRATIS** por compras a partir de **${formatCOP(EMPRESA.umbralEnvioGratis)}**. Para compras inferiores, la tarifa plana nacional es de ${formatCOP(EMPRESA.costoEnvioNacional)}. En ciudades principales (Bogotá, Medellín, Cali, Barranquilla) entregamos en 2 a 3 días hábiles. Consulta todos los detalles en nuestra sección de [Envíos](/envios).`,
      `Te cuento que realizamos despachos a todos los municipios del país. Los tiempos son: 2 a 3 días hábiles en ciudades principales y 3 a 5 días en otros municipios. Si tu pedido supera ${formatCOP(EMPRESA.umbralEnvioGratis)}, ¡el envío no tiene ningún costo! Además, te enviamos el número de guía para rastreo en tiempo real.`,
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ['¿Qué medios de pago aceptan?', '¿Tienen contraentrega?', 'Ver catálogo'],
      intent: 'envios',
      resolved: true,
    };
  }

  // F. Medios de Pago y Contraentrega
  if (/pago|pagar|contraentrega|efectivo|tarjeta|pse|nequi|daviplata|bancolombia|banco/i.test(lower)) {
    const replyVariants = [
      `Aceptamos 3 modalidades de pago 100% seguras en Colombia:\n1. **Pago Contraentrega en efectivo**: cancelas al mensajero cuando recibes el paquete en tu puerta.\n2. **PSE**: débito directo desde cuentas de ahorro o corriente (Bancolombia, Nequi, Daviplata, BBVA, etc.).\n3. **Tarjetas de Crédito y Débito**: Visa, Mastercard y American Express con cifrado SSL bancario.\nTodos los precios ya incluyen el 19% de IVA.`,
      `¡Claro que sí! Puedes pagar con total tranquilidad: aceptamos tarjetas bancarias, transferencias en línea vía PSE (incluidos Nequi y Daviplata) y también **Pago Contraentrega en efectivo** al momento de recibir en tu domicilio.`,
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ['¿Cómo son los envíos?', '¿Tienen cambios?', 'Ver productos populares'],
      intent: 'pagos',
      resolved: true,
    };
  }

  // G. Cambios y Devoluciones
  if (/cambio|cambiar|devoluci[oó]n|devolver|equivocad[ao]|talla no me sirvi[oó]|cambiar talla/i.test(lower)) {
    const replyVariants = [
      `En **${EMPRESA.nombreComercial}** cuentas con **${EMPRESA.diasCambioComercial} días calendario** para solicitar cambios comerciales por talla, color o modelo. La prenda debe estar sin usar, limpia y con sus etiquetas intactas. Puedes tramitar tu cambio desde nuestro canal de WhatsApp ${EMPRESA.whatsapp} o revisando la sección de [Cambios y Devoluciones](/cambios-y-devoluciones).`,
      `Dispones de hasta ${EMPRESA.diasCambioComercial} días para realizar cambios si la prenda no te quedó como esperabas. Solo exigimos que conserve sus etiquetas originales y esté en perfecto estado sin uso. ¡Tu satisfacción es nuestra prioridad!`,
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ['¿Cómo es el derecho de retracto?', 'Ver guía de tallas', 'Hablar por WhatsApp'],
      intent: 'cambios',
      resolved: true,
    };
  }

  // H. Derecho de Retracto Legal (Ley 1480 Art. 47)
  if (/retracto|devoluci[oó]n de dinero|reembolso|ley 1480|estatuto del consumidor/i.test(lower)) {
    const reply = `Conforme al artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), tienes derecho a retractarte de tu compra dentro de los **${EMPRESA.diasRetractoLegal} días hábiles** siguientes a la entrega de la prenda, recibiendo el reembolso íntegro de lo pagado. La prenda debe entregarse en las mismas condiciones en que la recibiste. Para radicarlo, puedes escribir a ${EMPRESA.correoPQRS} o en [PQRS](/pqrs).`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ['Radicar PQRS', 'Política de garantías', 'Hablar por WhatsApp'],
      intent: 'retracto',
      resolved: true,
    };
  }

  // I. Garantía Legal
  if (/garant[ií]a|defecto|dañad[ao]|fallo de fabricaci[oó]n|costura|roto/i.test(lower)) {
    const reply = `Todas las prendas y calzado de **${EMPRESA.nombreComercial}** cuentan con una **garantía legal de ${EMPRESA.diasGarantiaLegal} días** calendario a partir de la entrega por defectos de fabricación o confección. Ante cualquier inconveniente, nos encargamos de la reparación, reposición o reembolso según la ley colombiana. Escríbenos a ${EMPRESA.correoPQRS}.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ['Radicar garantía en PQRS', 'Tiempos de entrega', 'Contacto de soporte'],
      intent: 'garantias',
      resolved: true,
    };
  }

  // J. IVA e Impuestos
  if (/iva|impuesto|tributari[ao]|dian|factura/i.test(lower)) {
    const reply = `En **${EMPRESA.nombreComercial}** cumplimos estrictamente con el Estatuto Tributario colombiano. **El IVA del 19% ya está incluido** en todos los precios visibles en la tienda. En tu comprobante de pedido y correo de confirmación verás desglosada la base gravable y el valor exacto del impuesto liquidado.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ['Ver catálogo', 'Medios de pago', 'Preguntas frecuentes'],
      intent: 'iva',
      resolved: true,
    };
  }

  // K. Contacto, Sedes y Atención
  if (/contacto|tel[eé]fono|whatsapp|correo|direcci[oó]n|sede|d[oó]nde est[aá]n|oficina|horario/i.test(lower)) {
    const reply = `Nuestra sede principal está ubicada en ${EMPRESA.direccion}, ${EMPRESA.ciudad}, Colombia. Línea de atención: ${EMPRESA.telefono} · WhatsApp: ${EMPRESA.whatsapp} · Correo: ${EMPRESA.correoContacto}. Horario: ${EMPRESA.horarioAtencion}. Puedes visitar nuestra página de [Contacto](/contacto) para enviarnos un mensaje o ver el mapa.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ['Ir a contacto', 'Chatear por WhatsApp', 'Radicar PQRS'],
      intent: 'contacto',
      resolved: true,
    };
  }

  // L. Seguimiento sobre el último producto mostrado ("¿y en azul?", "¿cuánto cuesta el segundo?", "¿talla M?")
  if (lastProducts.length > 0) {
    // Follow-up about color
    if (/azul|negro|blanco|verde|beige|rojo|gris|color|colores|otro color/i.test(lower)) {
      const targetProd = lastProducts[0];
      const availableColors = targetProd.colors.map(c => c.name).join(', ');
      const requestedColor = ['azul', 'negro', 'blanco', 'verde', 'beige', 'rojo', 'gris', 'lavanda', 'obsidiana']
        .find(col => lower.includes(col));

      const hasRequestedColor = requestedColor
        ? targetProd.colors.some(c => c.name.toLowerCase().includes(requestedColor))
        : false;

      let reply = '';
      if (requestedColor && hasRequestedColor) {
        reply = `¡Sí! Para **${targetProd.name}** tenemos disponible la variante en tono ${requestedColor.toUpperCase()}. Los colores de esta prenda son: ${availableColors}. Puedes seleccionarlo directamente desde la tarjeta de la prenda o al abrirla.`;
      } else if (requestedColor && !hasRequestedColor) {
        reply = `Para **${targetProd.name}** no tenemos actualmente el tono ${requestedColor}. Los colores confeccionados son: **${availableColors}**. Si deseas, te puedo buscar otra prenda de ${targetProd.category} que sí venga en ${requestedColor}.`;
      } else {
        reply = `Para **${targetProd.name}**, los colores disponibles son: **${availableColors}**. ¿Te gustaría ver cómo lucen o explorar otra referencia?`;
      }

      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ['¿Qué tallas tienen?', '¿Cuánto cuesta el envío?', 'Ver otra prenda similar'],
        intent: 'seguimiento_color',
        resolved: true,
      };
    }

    // Follow-up about price ("¿cuánto cuesta el segundo?", "¿cuál es el precio?", "¿cuánto vale?")
    if (/cu[aá]nto cuesta|cu[aá]nto vale|precio|cu[aá]l es el costo|segund[oa]|primer[oa]/i.test(lower)) {
      const isSecond = /segund[oa]/i.test(lower) && lastProducts.length > 1;
      const targetProd = isSecond ? lastProducts[1] : lastProducts[0];
      const finalPrice = targetProd.discountPrice || targetProd.price;
      const hasDiscount = Boolean(targetProd.discountPrice);

      const reply = `El valor de **${targetProd.name}** es de **${formatCOP(finalPrice)}** con el IVA del 19% ya liquidado.${hasDiscount ? ` (Presenta precio especial de descuento frente al precio habitual de ${formatCOP(targetProd.price)}).` : ''} Recuerda que si completas ${formatCOP(EMPRESA.umbralEnvioGratis)} en tu pedido, ¡el flete a toda Colombia es totalmente gratis!`;

      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ['Agregar al carrito', '¿Tienen mi talla?', '¿Cómo son los medios de pago?'],
        intent: 'seguimiento_precio',
        resolved: true,
      };
    }

    // Follow-up about size ("¿tienen talla M?", "¿hay talla 39?", "¿qué tallas hay?")
    if (/\b(talla|tallas|medida|medidas)\b|\b(36|37|38|39|40|41|42|43|xs|s|m|l|xl)\b/i.test(lower)) {
      const targetProd = lastProducts[0];
      const availableSizes = targetProd.sizes.join(', ');
      const requestedSize = ['xs', 's', 'm', 'l', 'xl', '36', '37', '38', '39', '40', '41', '42', '43']
        .find(sz => new RegExp(`\\b${sz}\\b`, 'i').test(lower));

      let reply = '';
      if (requestedSize) {
        const hasSize = targetProd.sizes.some(s => s.toLowerCase() === requestedSize.toLowerCase());
        if (hasSize) {
          reply = `¡Claro que sí! **${targetProd.name}** se encuentra disponible en talla **${requestedSize.toUpperCase()}**. Las tallas de fabricación para este modelo son: ${availableSizes}. Te sugiero añadirla al carrito antes de que se agoten las existencias.`;
        } else {
          reply = `Para **${targetProd.name}** actualmente no disponemos de la talla ${requestedSize.toUpperCase()}. Sus tallas activas son: **${availableSizes}**. ¿Deseas que busquemos una alternativa en tu talla exacta?`;
        }
      } else {
        reply = `Para **${targetProd.name}**, las tallas disponibles son: **${availableSizes}**. Si tienes dudas sobre cómo medirte, puedes consultar nuestra [Guía de Tallas](/guia-de-tallas).`;
      }

      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ['Ver guía de tallas', 'Agregar al carrito', '¿Cómo son los cambios?'],
        intent: 'seguimiento_talla',
        resolved: true,
      };
    }
  }

  // M. Guía de Tallas General
  if (/talla|medidas|qu[eé] talla soy|cent[ií]metros|cm|como elegir mi talla/i.test(lower)) {
    const reply = `Para calzado colombiano manejamos numeración del 36 al 43 (ej: talla 39 corresponde a ~25.5 cm de longitud de pie). En prendas superiores e inferiores confeccionamos desde XS hasta XL con siluetas contemporáneas y regulares. Te invitamos a consultar nuestra [Guía de Tallas](/guia-de-tallas) con tablas de medidas precisas en centímetros.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ['Ver calzado', '¿Cómo son los cambios?', 'Hablar con un asesor'],
      intent: 'tallas',
      resolved: true,
    };
  }

  // N. Explorar colecciones, tendencias o descuentos
  if (/nueva colecci[oó]n|tendencia|descuento|oferta|promoci[oó]n|liquidaci[oó]n|lookbook/i.test(lower)) {
    const isDiscount = /descuento|oferta|promoci[oó]n/i.test(lower);
    const relevantProducts = isDiscount
      ? catalog.filter(p => Boolean(p.discountPrice)).slice(0, 3)
      : catalog.filter(p => p.isNew || p.isPopular).slice(0, 3);

    const reply = isDiscount
      ? `¡Tenemos excelentes promociones de temporada! Puedes explorar todas las prendas con descuento activo en nuestra sección de [Descuentos Especiales](/descuentos). Aquí te presento algunas piezas seleccionadas:`
      : `Te invito a conocer lo más reciente en moda contemporánea en nuestra [Nueva Colección](/nueva-coleccion) y las piezas destacadas en [Tendencias](/tendencias). Mira estas opciones destacadas:`;

    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: relevantProducts.map(p => p.id),
      suggestions: isDiscount ? ['Ver más descuentos', 'Menos de $150.000', '¿Cómo son los envíos?'] : ['Ver tendencias', 'Zapatos urbanos', 'Chaquetas elegantes'],
      intent: 'colecciones',
      resolved: true,
    };
  }

  // N. Búsqueda de productos en el catálogo
  const topMatches = scoredCandidates.filter(c => c.score > 15).slice(0, 3);
  if (topMatches.length > 0) {
    const matchedProds = topMatches.map(c => c.product);
    const top = matchedProds[0];
    const finalPrice = top.discountPrice || top.price;

    const replyVariants = [
      `¡Excelente elección! Te recomiendo especialmente **${top.name}** (${formatCOP(finalPrice)}, IVA 19% incluido) de nuestra categoría de ${top.category}. Es una prenda destacada por su confort y confección nacional de alta durabilidad. ¿Te gustaría verla en algún color o talla en específico?`,
      `He seleccionado para ti **${top.name}** por ${formatCOP(finalPrice)}. Combina diseño contemporáneo y acabados impecables. Además, aquí tienes otras opciones de la misma línea que van perfecto con ese estilo:`,
      `Revisando nuestro catálogo en bodega, **${top.name}** se ajusta perfecto a lo que buscas. Está disponible para despacho inmediato a toda Colombia. ¿Qué talla sueles utilizar habitualmente?`,
    ];

    const reply = avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants);
    return {
      reply,
      productIds: matchedProds.map(p => p.id),
      suggestions: ['¿Hay en otros colores?', '¿Qué tallas tienen?', '¿Cómo es el envío?'],
      intent: 'busqueda_catalogo',
      resolved: true,
    };
  }

  // O. Natural Clarifying Fallback (Ask ONE question, never repeat same static sentence)
  const clarifyingResponses = [
    `Con mucho gusto te asesoro. Para encontrar la prenda ideal para ti, ¿para qué ocasión la necesitas (casual, oficina, fiesta o deporte) o tienes algún color o presupuesto en mente?`,
    `¡Claro que sí! Cuéntame un poco más sobre el estilo que buscas: ¿prefieres prendas superiores como chaquetas y camisetas, calzado urbano o accesorios de cuero?`,
    `En ${EMPRESA.nombreComercial} tenemos colecciones de calzado, chaquetas, bolsos y prendas urbanas. ¿Tienes alguna talla o presupuesto específico para filtrarte las mejores opciones?`,
  ];

  const defaultReply = avoidExactRepetition(clarifyingResponses[0], lastAssistantText, clarifyingResponses);
  const featuredProds = catalog.filter(p => p.isPopular || p.isNew).slice(0, 2);

  return {
    reply: defaultReply,
    productIds: featuredProds.map(p => p.id),
    suggestions: ['👟 Tenis urbanos', '🧥 Chaquetas y blazers', '👜 Bolsos en cuero'],
    intent: 'consulta_general',
    resolved: false,
  };
}
